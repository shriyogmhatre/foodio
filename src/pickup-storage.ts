import { defaultPickupPoints, type PickupPoint } from './data'

const STORAGE_KEY = 'foodio-pickup-points'

export function loadPickupPoints(): PickupPoint[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultPickupPoints
    const points: unknown = JSON.parse(stored)
    return Array.isArray(points) && points.length > 0 ? points as PickupPoint[] : defaultPickupPoints
  } catch {
    return defaultPickupPoints
  }
}

export function savePickupPoints(points: PickupPoint[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(points))
  window.dispatchEvent(new Event('foodio-pickups-updated'))
}
