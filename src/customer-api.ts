export type Customer = { id: string; email: string; name: string; phone: string }
export type SavedOrder = { id: string; total_paise: number; status: string }
export async function customerRequest<T>(action: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api/customer?action=${action}`, { method: body ? 'POST' : 'GET', credentials: 'same-origin', cache: 'no-store', headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined })
  const result = await response.json().catch(() => ({ error: 'Login service is unavailable. Please try again later.' }))
  if (!response.ok) throw new Error(result.error || 'Could not complete your request.')
  return result
}
