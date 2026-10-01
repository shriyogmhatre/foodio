import { FormEvent, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, Eye, EyeOff, LogOut, MapPin, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import type { PickupPoint } from '../data'
import { loadPickupPoints, savePickupPoints } from '../pickup-storage'

const USERNAME = 'foodio'
const PASSWORD_HASH = '958b62bd680d4dbe962e5175ab48b214ac49ba6bf51d3b3da1afac457a3f4f50'

type PointForm = Omit<PickupPoint, 'id'>
const EMPTY_FORM: PointForm = { name: '', address: '', time: '15 min', distance: '1.0 km', x: 50, y: 50 }

async function hash(value: string) {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function AdminPage() {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem('foodio-admin-session') === 'active')
  const [dark, setDark] = useState(() => localStorage.getItem('foodio-theme') === 'dark')
  const [points, setPoints] = useState(loadPickupPoints)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PointForm>(EMPTY_FORM)
  const [message, setMessage] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('foodio-theme', dark ? 'dark' : 'light')
  }, [dark])

  if (!authenticated) return <AdminLogin onLogin={() => { sessionStorage.setItem('foodio-admin-session', 'active'); setAuthenticated(true) }} dark={dark} onToggleTheme={() => setDark((value) => !value)} />

  const editPoint = (point: PickupPoint) => {
    setEditingId(point.id)
    setForm({ name: point.name, address: point.address, time: point.time, distance: point.distance, x: point.x, y: point.y })
    setMessage('')
    document.getElementById('point-name')?.focus()
  }

  const resetForm = () => { setEditingId(null); setForm(EMPTY_FORM); setMessage('') }

  const submitPoint = (event: FormEvent) => {
    event.preventDefault()
    if (!form.name.trim() || !form.address.trim()) { setMessage('Name and address are required.'); return }
    if (form.x < 5 || form.x > 95 || form.y < 5 || form.y > 95) { setMessage('Map coordinates must be between 5 and 95.'); return }
    const next = editingId
      ? points.map((point) => point.id === editingId ? { ...point, ...form } : point)
      : [...points, { id: `${form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`, ...form }]
    setPoints(next)
    savePickupPoints(next)
    resetForm()
    setMessage('Pickup points saved in this browser.')
  }

  const removePoint = (id: string) => {
    if (points.length === 1) { setMessage('At least one pickup point is required.'); return }
    const next = points.filter((point) => point.id !== id)
    setPoints(next)
    savePickupPoints(next)
    if (editingId === id) resetForm()
    setMessage('Pickup point removed.')
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <a className="brand" href="/"><span className="brand-mark">F</span><span><strong>FOODIO</strong><br />ADMIN STUDIO</span></a>
        <div><button className="admin-text-button" onClick={() => setDark((value) => !value)}>{dark ? 'Light mode' : 'Dark mode'}</button><button className="admin-text-button" onClick={() => { sessionStorage.removeItem('foodio-admin-session'); setAuthenticated(false) }}><LogOut size={16} /> Log out</button></div>
      </header>
      <section className="admin-intro"><div><span className="eyebrow"><MapPin size={14} /> Pickup operations</span><h1>Pickup points.</h1><p>Add locations and position each marker on the customer map with X and Y coordinates.</p></div><a href="/" className="admin-text-button"><ArrowLeft size={16} /> View storefront</a></section>
      <section className="admin-grid">
        <form className="point-form" onSubmit={submitPoint}>
          <div className="form-title"><div><span>{editingId ? 'Editing location' : 'New location'}</span><h2>{editingId ? 'Update pickup point' : 'Create pickup point'}</h2></div>{editingId && <button type="button" className="icon-button" onClick={resetForm} aria-label="Cancel editing"><X size={18} /></button>}</div>
          <label>Name<input id="point-name" autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Foodio Bandra" /></label>
          <label>Address<input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Street and landmark" /></label>
          <div className="form-row"><label>Prep time<input value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} placeholder="15 min" /></label><label>Distance<input value={form.distance} onChange={(event) => setForm({ ...form, distance: event.target.value })} placeholder="1.0 km" /></label></div>
          <div className="form-row"><label>Map X (%)<input type="number" min="5" max="95" value={form.x} onChange={(event) => setForm({ ...form, x: Number(event.target.value) })} /></label><label>Map Y (%)<input type="number" min="5" max="95" value={form.y} onChange={(event) => setForm({ ...form, y: Number(event.target.value) })} /></label></div>
          <div className="coordinate-preview"><span className="preview-pin" style={{ left: `${form.x}%`, top: `${form.y}%` }}><MapPin size={18} /></span><small>Marker preview</small></div>
          {message && <p className={message.includes('required') || message.includes('between') ? 'form-message error' : 'form-message'} role="status">{message}</p>}
          <button className="primary-button admin-save" type="submit">{editingId ? <Save size={18} /> : <Plus size={18} />}{editingId ? 'Save changes' : 'Add pickup point'}</button>
        </form>
        <div className="point-manager"><div className="manager-heading"><span>{points.length} active</span><h2>Live locations</h2></div><div className="admin-point-list">{points.map((point) => <article key={point.id}><span className="admin-point-number"><MapPin size={17} /></span><div><strong>{point.name}</strong><p>{point.address}</p><small>{point.time} · {point.distance} · X {point.x}, Y {point.y}</small></div><div><button onClick={() => editPoint(point)} aria-label={`Edit ${point.name}`}><Pencil size={16} /></button><button onClick={() => removePoint(point.id)} aria-label={`Delete ${point.name}`}><Trash2 size={16} /></button></div></article>)}</div></div>
      </section>
    </main>
  )
}

function AdminLogin({ onLogin, dark, onToggleTheme }: { onLogin: () => void; dark: boolean; onToggleTheme: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const usernameRef = useRef<HTMLInputElement>(null)
  useEffect(() => { usernameRef.current?.focus() }, [])

  const login = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError('')
    const valid = username.trim().toLowerCase() === USERNAME && await hash(password) === PASSWORD_HASH
    if (valid) onLogin(); else setError('The username or password is incorrect.')
    setLoading(false)
  }

  return <main className="login-page"><button className="admin-theme" onClick={onToggleTheme}>{dark ? 'Light mode' : 'Dark mode'}</button><form className="login-card" onSubmit={login}><div className="brand login-brand"><span className="brand-mark">F</span><span><strong>FOODIO</strong><br />ADMIN STUDIO</span></div><span className="eyebrow">Private access</span><h1>Welcome back.</h1><p>Sign in to manage Foodio pickup points.</p><label>Username<input ref={usernameRef} autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} /></label><label>Password<span className="password-field"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>{error && <p className="login-error" role="alert">{error}</p>}<button className="primary-button login-submit" disabled={loading || !username || !password}>{loading ? 'Signing in…' : <><Check size={18} /> Sign in</>}</button><a href="/">← Back to Foodio</a></form></main>
}
