import { randomBytes, randomInt, randomUUID } from 'node:crypto'
import pg from 'pg'
import { digest, otpDigest, matches, emailAddress, profile, isUUID, priceOrder, HttpError } from '../server/security.js'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 8000 })
const COOKIE = 'foodio_session'
const DAYS = 7 * 24 * 60 * 60
const configured = () => Boolean(process.env.RESEND_API_KEY && process.env.OTP_SECRET?.length >= 32 && process.env.EMAIL_FROM)
const cookie = (token, age = DAYS) => `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${process.env.VERCEL ? '; Secure' : ''}`
const send = (res, status, body) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)) }

async function transaction(fn) {
  const client = await pool.connect()
  try { await client.query('BEGIN'); const result = await fn(client); await client.query('COMMIT'); return result }
  catch (error) { await client.query('ROLLBACK'); throw error }
  finally { client.release() }
}
async function customer(req) {
  const token = (req.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1)
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null
  const result = await pool.query('SELECT c.id, c.email, c.name, c.phone FROM customer_sessions s JOIN customers c ON c.id=s.customer_id WHERE s.token_hash=$1 AND s.expires_at > now()', [digest(token)])
  return result.rows[0] || null
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  try {
    if (!process.env.DATABASE_URL) throw new HttpError(503, 'Customer login is being set up. Please try again later.')
    const action = new URL(req.url, 'https://foodio.food').searchParams.get('action') || 'session'
    if (req.method === 'GET' && action === 'session') return send(res, 200, { customer: await customer(req), loginAvailable: configured() })
    if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); throw new HttpError(405, 'Method not allowed.') }
    const origins = ['https://foodio.food', 'https://www.foodio.food']
    if (!process.env.VERCEL) origins.push('http://localhost:3000', 'http://127.0.0.1:3000')
    if (!origins.includes(req.headers.origin) || !String(req.headers['content-type']).startsWith('application/json')) throw new HttpError(403, 'Please use the Foodio website to continue.')
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    if (!body || typeof body !== 'object' || Array.isArray(body) || JSON.stringify(body).length > 8000) throw new HttpError(400, 'Invalid request.')

    if (action === 'request-code') {
      if (!configured()) throw new HttpError(503, 'Email login is not available yet. Please try again later.')
      const email = emailAddress(body.email)
      const id = randomUUID(), code = String(randomInt(100000, 1000000))
      // Vercel supplies this header; only hashed network identifiers are stored.
      const ip = String(req.headers['x-vercel-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim()
      const ipHash = otpDigest('ip', ip, process.env.OTP_SECRET)
      await transaction(async (db) => {
        // Serialize reservations across instances so abuse cannot exceed the free-tier cap.
        await db.query('SELECT pg_advisory_xact_lock(730281)')
        const { rows: [counts] } = await db.query(`SELECT
          count(*) FILTER (WHERE created_at > now()-interval '24 hours')::int AS daily,
          count(*)::int AS monthly,
          count(*) FILTER (WHERE email=$1 AND created_at > now()-interval '1 hour')::int AS email_hour,
          count(*) FILTER (WHERE ip_hash=$2 AND created_at > now()-interval '1 hour')::int AS ip_hour,
          count(*) FILTER (WHERE email=$1 AND created_at > now()-interval '60 seconds')::int AS cooldown
          FROM email_challenges WHERE created_at > now()-interval '31 days'`, [email, ipHash])
        if (counts.daily >= 90 || counts.monthly >= 2800) throw new HttpError(429, 'Today’s email login allowance is busy. Please try again later.')
        if (counts.cooldown || counts.email_hour >= 5 || counts.ip_hour >= 20) throw new HttpError(429, 'Too many code requests. Please wait before trying again.')
        await db.query('INSERT INTO email_challenges(id,email,code_hash,ip_hash,expires_at) VALUES($1,$2,$3,$4,now()+interval \'10 minutes\')', [id, email, otpDigest(id, code, process.env.OTP_SECRET), ipHash])
      })
      let response
      try {
        response = await fetch('https://api.resend.com/emails', { method: 'POST', signal: AbortSignal.timeout(12000), headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `foodio-otp-${id}` }, body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [email], subject: 'Your Foodio login code', text: `Your Foodio code is ${code}. It expires in 10 minutes and can be used once. Do not share this code. If you did not request it, ignore this email.` }) })
      } catch { throw new HttpError(503, 'We could not send your code. Please wait a minute and try again.') }
      if (!response.ok) throw new HttpError(503, 'We could not send your code. Please wait a minute and try again.')
      await pool.query('UPDATE email_challenges SET sent=true WHERE id=$1', [id])
      return send(res, 200, { challengeId: id, expiresIn: 600, retryAfter: 60 })
    }
    if (action === 'verify-code') {
      if (!configured()) throw new HttpError(503, 'Email login is not available yet.')
      if (!isUUID(body.challengeId) || typeof body.code !== 'string' || !/^\d{6}$/.test(body.code)) throw new HttpError(400, 'Enter the six-digit code from your email.')
      const contact = profile(body), token = randomBytes(32).toString('hex')
      const account = await transaction(async (db) => {
        const { rows: [challenge] } = await db.query('SELECT *, expires_at > now() AS valid FROM email_challenges WHERE id=$1 FOR UPDATE', [body.challengeId])
        if (!challenge || !challenge.sent || !challenge.valid || challenge.consumed_at || challenge.attempts >= 5) return null
        await db.query('UPDATE email_challenges SET attempts=attempts+1 WHERE id=$1', [challenge.id])
        if (!matches(challenge.code_hash, otpDigest(challenge.id, body.code, process.env.OTP_SECRET))) return null
        await db.query('UPDATE email_challenges SET consumed_at=now() WHERE email=$1 AND consumed_at IS NULL', [challenge.email])
        const { rows: [user] } = await db.query('INSERT INTO customers(id,email,name,phone) VALUES($1,$2,$3,$4) ON CONFLICT(email) DO UPDATE SET name=excluded.name,phone=excluded.phone,updated_at=now() RETURNING id,email,name,phone', [randomUUID(), challenge.email, contact.name, contact.phone])
        await db.query('INSERT INTO customer_sessions(token_hash,customer_id,expires_at) VALUES($1,$2,now()+interval \'7 days\')', [digest(token), user.id])
        return user
      })
      if (!account) throw new HttpError(400, 'That code is incorrect, expired, or already used. Request a new code after five attempts.')
      res.setHeader('Set-Cookie', cookie(token))
      return send(res, 200, { customer: account })
    }
    const user = await customer(req)
    if (!user) throw new HttpError(401, 'Please sign in to continue.')
    if (action === 'logout') {
      const token = (req.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1)
      await pool.query('DELETE FROM customer_sessions WHERE token_hash=$1', [digest(token)])
      res.setHeader('Set-Cookie', cookie('', 0))
      return send(res, 200, { ok: true })
    }
    if (action === 'order') {
      if (!isUUID(body.requestId) || typeof body.pickupId !== 'string') throw new HttpError(400, 'Choose a pickup point and try again.')
      const priced = priceOrder(body.items)
      const order = await transaction(async (db) => {
        await db.query('SELECT id FROM customers WHERE id=$1 FOR UPDATE', [user.id])
        const { rows: [existing] } = await db.query('SELECT id,total_paise,status FROM orders WHERE customer_id=$1 AND request_id=$2', [user.id, body.requestId])
        if (existing) return existing
        const { rows: [count] } = await db.query('SELECT count(*)::int AS total FROM orders WHERE customer_id=$1 AND created_at > now()-interval \'1 hour\'', [user.id])
        if (count.total >= 5) throw new HttpError(429, 'You have placed several orders recently. Please try again later.')
        const { rows: [pickup] } = await db.query('SELECT id,name,address FROM pickup_points WHERE id=$1 AND active=true FOR SHARE', [body.pickupId])
        if (!pickup) throw new HttpError(400, 'This pickup point is no longer available. Please choose another.')
        const { rows: [saved] } = await db.query('INSERT INTO orders(id,customer_id,request_id,pickup_id,pickup_name,pickup_address,customer_name,contact_phone,items,total_paise) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id,total_paise,status', [randomUUID(), user.id, body.requestId, pickup.id, pickup.name, pickup.address, user.name, user.phone, JSON.stringify(priced.items), priced.total])
        return saved
      })
      return send(res, 201, { order })
    }
    throw new HttpError(404, 'Unknown request.')
  } catch (error) {
    // Never log codes, credentials, cookies, or customer details.
    return send(res, error instanceof HttpError ? error.status : 500, { error: error instanceof HttpError ? error.message : 'Something went wrong. Please try again.' })
  }
}
