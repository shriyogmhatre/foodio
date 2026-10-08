import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status }
}
export const digest = (value) => createHash('sha256').update(value).digest('hex')
export const otpDigest = (id, code, secret) => createHmac('sha256', secret).update(`${id}:${code}`).digest('hex')
export function matches(a, b) {
  const left = Buffer.from(a, 'hex'), right = Buffer.from(b, 'hex')
  return left.length === right.length && timingSafeEqual(left, right)
}
export function emailAddress(value) {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : ''
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Enter a valid email address.')
  return email
}
export function profile(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.replace(/[\s()-]/g, '') : ''
  const local = phone.replace(/^\+91/, '')
  if (name.length < 2 || name.length > 80) throw new HttpError(400, 'Enter your name (2–80 characters).')
  if (!/^[6-9]\d{9}$/.test(local)) throw new HttpError(400, 'Enter a valid 10-digit Indian mobile number.')
  return { name, phone: `+91${local}` }
}
export const isUUID = (value) => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
// Server-owned menu: never accept a browser-supplied name or price.
export const catalog = {
  'studio-classic': { name: 'Studio Classic', price: 18900 },
  firebird: { name: 'The Firebird', price: 21900 },
  'green-room': { name: 'Green Room', price: 17900 },
  'chicken-plate': { name: 'Chicken Artist Plate', price: 32900 },
  'mezze-plate': { name: 'Mezze Mood', price: 29900 },
  'loaded-fries': { name: 'Sumac Loaded Fries', price: 14900 },
}
export function priceOrder(lines) {
  if (!Array.isArray(lines) || !lines.length || lines.length > 6) throw new HttpError(400, 'Choose between 1 and 6 menu items.')
  const seen = new Set()
  const items = lines.map((line) => {
    const item = line && Object.hasOwn(catalog, line.id) ? catalog[line.id] : null
    if (!item || seen.has(line.id) || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 10) throw new HttpError(400, 'Choose valid items and quantities (maximum 10 each).')
    seen.add(line.id)
    return { id: line.id, name: item.name, quantity: line.quantity, unitPricePaise: item.price }
  })
  return { items, total: items.reduce((sum, item) => sum + item.unitPricePaise * item.quantity, 0) }
}
