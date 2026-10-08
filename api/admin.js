import pg from 'pg'
import { HttpError } from '../server/security.js'

const PICKUP_API_URL = 'https://br-shy-flower-b3dxsdky-pickups.compute.c-4.ap-southeast-1.aws.neon.tech/'
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 8000 })
const send = (res, status, body) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)) }

async function requireAdmin(req) {
  const authorization = req.headers.authorization || ''
  const match = /^Basic ([A-Za-z0-9+/]+=*)$/.exec(authorization)
  if (!match) throw new HttpError(401, 'Please sign in to view customers.')

  const credentials = Buffer.from(match[1], 'base64').toString('utf8')
  const separator = credentials.indexOf(':')
  if (separator < 1 || credentials.length > 512) throw new HttpError(401, 'Please sign in to view customers.')

  let response
  try {
    response = await fetch(new URL('auth', PICKUP_API_URL), {
      method: 'POST',
      headers: { Authorization: authorization },
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    throw new HttpError(503, 'Admin authentication is temporarily unavailable.')
  }
  if (!response.ok) throw new HttpError(401, 'Your admin session is no longer valid. Please sign in again.')
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  try {
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); throw new HttpError(405, 'Method not allowed.') }
    if (!process.env.DATABASE_URL) throw new HttpError(503, 'Customer records are temporarily unavailable.')
    await requireAdmin(req)

    const url = new URL(req.url, 'https://foodio.food')
    const offset = Number(url.searchParams.get('offset') || 0)
    if (!Number.isSafeInteger(offset) || offset < 0 || offset > 100000) throw new HttpError(400, 'Invalid customer-list page.')
    const [{ rows: [summary] }, { rows }] = await Promise.all([
      pool.query('SELECT count(*)::int AS total FROM customers'),
      pool.query('SELECT id,email,name,phone,email_verified_at,created_at FROM customers ORDER BY created_at DESC,id LIMIT 100 OFFSET $1', [offset]),
    ])
    return send(res, 200, { customers: rows, total: summary.total, offset })
  } catch (error) {
    return send(res, error instanceof HttpError ? error.status : 500, { error: error instanceof HttpError ? error.message : 'Could not load customer records.' })
  }
}
