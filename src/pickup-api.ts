import type { PickupPoint } from './data'

const API_URL = 'https://br-shy-flower-b3dxsdky-pickups.compute.c-4.ap-southeast-1.aws.neon.tech/'
export type AdminCredentials = { username: string; password: string }

async function json<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({})) as T & { error?: string }
  if (!response.ok) throw new Error(body.error || 'Something went wrong. Please try again.')
  return body
}

export function loadPickupPoints() {
  return fetch(API_URL, { cache: 'no-store' }).then((response) => json<PickupPoint[]>(response))
}

function authorization(credentials: AdminCredentials) {
  return `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
}

export function createPickupPoint(point: Omit<PickupPoint, 'id'>, credentials: AdminCredentials) {
  return fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authorization(credentials) },
    body: JSON.stringify(point),
  }).then((response) => json<PickupPoint>(response))
}

export function updatePickupPoint(point: PickupPoint, credentials: AdminCredentials) {
  return fetch(API_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: authorization(credentials) },
    body: JSON.stringify(point),
  }).then((response) => json<PickupPoint>(response))
}

export function deletePickupPoint(id: string, credentials: AdminCredentials) {
  return fetch(`${API_URL}?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Authorization: authorization(credentials) } }).then((response) => json<{ deleted: string }>(response))
}

export async function loginAdmin(username: string, password: string) {
  const credentials = { username, password }
  await fetch(new URL('auth', API_URL), {
    method: 'POST',
    headers: { Authorization: authorization(credentials) },
  }).then((response) => json<{ authenticated: true }>(response))
  return credentials
}
