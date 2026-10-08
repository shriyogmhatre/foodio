import { FormEvent, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, Eye, EyeOff, LoaderCircle, LogOut, Mail, MapPin, Pencil, Phone, Plus, Search, Save, Trash2, Users, X } from 'lucide-react'
import type { PickupPoint } from '../data'
import { createPickupPoint, deletePickupPoint, loadAdminCustomers, loadPickupPoints, loginAdmin, updatePickupPoint, type AdminCredentials, type AdminCustomer } from '../pickup-api'
import { AdminCoordinateMap } from './AdminCoordinateMap'

type PointForm = Omit<PickupPoint, 'id'>
const EMPTY_FORM: PointForm = { name: '', address: '', time: '15 min', distance: '1.0 km', lat: 18.994, lng: 73.1118 }

export function AdminPage() {
  const [credentials, setCredentials] = useState<AdminCredentials | null>(null)
  const [dark, setDark] = useState(() => localStorage.getItem('foodio-theme') === 'dark')
  const [points, setPoints] = useState<PickupPoint[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PointForm>(EMPTY_FORM)
  const [message, setMessage] = useState('')
  const [loadingPoints, setLoadingPoints] = useState(false)
  const [saving, setSaving] = useState(false)
  const [customers, setCustomers] = useState<AdminCustomer[]>([])
  const [customerTotal, setCustomerTotal] = useState(0)
  const [customersLoading, setCustomersLoading] = useState(false)
  const [customersError, setCustomersError] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('foodio-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    if (!credentials) return
    loadPickupPoints()
      .then(setPoints)
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setLoadingPoints(false))
    loadAdminCustomers(credentials)
      .then((page) => { setCustomers(page.customers); setCustomerTotal(page.total) })
      .catch((error: Error) => setCustomersError(error.message))
      .finally(() => setCustomersLoading(false))
  }, [credentials])

  if (!credentials) return <AdminLogin onLogin={(value) => { setLoadingPoints(true); setCustomersLoading(true); setCustomersError(''); setCredentials(value) }} dark={dark} onToggleTheme={() => setDark((value) => !value)} />

  const editPoint = (point: PickupPoint) => {
    setEditingId(point.id)
    setForm({ name: point.name, address: point.address, time: point.time, distance: point.distance, lat: point.lat, lng: point.lng })
    setMessage('')
    requestAnimationFrame(() => document.getElementById('point-name')?.focus())
  }

  const resetForm = () => { setEditingId(null); setForm(EMPTY_FORM); setMessage('') }

  const submitPoint = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.name.trim() || !form.address.trim()) { setMessage('Name and address are required.'); return }
    if (form.lat < -90 || form.lat > 90 || form.lng < -180 || form.lng > 180) { setMessage('Enter a valid latitude and longitude.'); return }
    setSaving(true); setMessage('')
    try {
      if (editingId) {
        const updated = await updatePickupPoint({ id: editingId, ...form }, credentials)
        setPoints((current) => current.map((point) => point.id === editingId ? updated : point))
        resetForm()
        setMessage('Pickup point updated in Neon.')
      } else {
        const created = await createPickupPoint(form, credentials)
        setPoints((current) => [...current, created])
        resetForm()
        setMessage('Pickup point created in Neon.')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save the pickup point.')
    } finally {
      setSaving(false)
    }
  }

  const removePoint = async (id: string) => {
    if (points.length === 1) { setMessage('At least one pickup point is required.'); return }
    setSaving(true); setMessage('')
    try {
      await deletePickupPoint(id, credentials)
      setPoints((current) => current.filter((point) => point.id !== id))
      if (editingId === id) resetForm()
      setMessage('Pickup point removed from Neon.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not remove the pickup point.')
    } finally {
      setSaving(false)
    }
  }

  const logOut = () => {
    setCredentials(null)
    setPoints([])
    setCustomers([])
    setCustomerTotal(0)
    setCustomerSearch('')
    setCustomersLoading(false)
  }

  const loadMoreCustomers = async () => {
    if (!credentials || customersLoading) return
    setCustomersLoading(true)
    setCustomersError('')
    try {
      const page = await loadAdminCustomers(credentials, customers.length)
      setCustomers((current) => [...current, ...page.customers])
      setCustomerTotal(page.total)
    } catch (error) {
      setCustomersError(error instanceof Error ? error.message : 'Could not load more customers.')
    } finally {
      setCustomersLoading(false)
    }
  }

  const visibleCustomers = customers.filter((customer) => `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase().includes(customerSearch.trim().toLowerCase()))

  const hasError = /required|valid|could not|unavailable|unauthorized/i.test(message)

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <a className="brand" href="/"><span className="brand-mark">F</span><span><strong>FOODIO</strong><br />ADMIN STUDIO</span></a>
        <div><button className="admin-text-button" onClick={() => setDark((value) => !value)}>{dark ? 'Light mode' : 'Dark mode'}</button><button className="admin-text-button" onClick={logOut}><LogOut size={16} /> Log out</button></div>
      </header>
      <section className="admin-intro"><div><span className="eyebrow"><MapPin size={14} /> Pickup operations</span><h1>Pickup points.</h1><p>Add locations and place each marker precisely on Google Maps. Changes are shared through Neon.</p></div><a href="/" className="admin-text-button"><ArrowLeft size={16} /> View storefront</a></section>
      <section className="admin-grid">
        <form className="point-form" onSubmit={submitPoint} aria-busy={saving}>
          <div className="form-title"><div><span>{editingId ? 'Editing location' : 'New location'}</span><h2>{editingId ? 'Update pickup point' : 'Create pickup point'}</h2></div>{editingId && <button type="button" className="icon-button" onClick={resetForm} aria-label="Cancel editing" disabled={saving}><X size={18} /></button>}</div>
          <label>Name<input id="point-name" autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Foodio Bandra" disabled={saving} /></label>
          <label>Address<input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Street and landmark" disabled={saving} /></label>
          <div className="form-row"><label>Prep time<input value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} placeholder="15 min" disabled={saving} /></label><label>Distance<input value={form.distance} onChange={(event) => setForm({ ...form, distance: event.target.value })} placeholder="1.0 km" disabled={saving} /></label></div>
          <div className="form-row"><label>Latitude<input type="number" min="-90" max="90" step="0.000001" value={form.lat} onChange={(event) => setForm({ ...form, lat: Number(event.target.value) })} disabled={saving} /></label><label>Longitude<input type="number" min="-180" max="180" step="0.000001" value={form.lng} onChange={(event) => setForm({ ...form, lng: Number(event.target.value) })} disabled={saving} /></label></div>
          <AdminCoordinateMap lat={form.lat} lng={form.lng} dark={dark} onChange={(coordinates) => setForm({ ...form, ...coordinates })} />
          {message && <p className={`form-message${hasError ? ' error' : ''}`} role={hasError ? 'alert' : 'status'}>{message}</p>}
          <button className="primary-button admin-save" type="submit" disabled={saving}>{saving ? <LoaderCircle className="spin" size={18} /> : editingId ? <Save size={18} /> : <Plus size={18} />}{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add pickup point'}</button>
        </form>
        <div className="point-manager" aria-busy={loadingPoints}><div className="manager-heading"><span>{loadingPoints ? 'Loading' : `${points.length} active`}</span><h2>Live locations</h2></div>{loadingPoints ? <p className="manager-status" role="status"><LoaderCircle className="spin" /> Loading from Neon…</p> : <div className="admin-point-list">{points.map((point) => <article key={point.id}><span className="admin-point-number"><MapPin size={17} /></span><div><strong>{point.name}</strong><p>{point.address}</p><small>{point.time} · {point.distance} · {point.lat.toFixed(5)}, {point.lng.toFixed(5)}</small></div><div><button onClick={() => editPoint(point)} aria-label={`Edit ${point.name}`} disabled={saving}><Pencil size={16} /></button><button onClick={() => removePoint(point.id)} aria-label={`Delete ${point.name}`} disabled={saving}><Trash2 size={16} /></button></div></article>)}</div>}</div>
      </section>
      <section className="customer-manager" aria-busy={customersLoading} aria-labelledby="customer-manager-title">
        <div className="customer-manager-heading"><div><span className="eyebrow"><Users size={14} /> Customer directory</span><h2 id="customer-manager-title">Your people.</h2><p>Accounts created after email verification. Phone numbers are saved as pickup contacts.</p></div><strong className="customer-count">{customersLoading && customers.length === 0 ? 'Loading…' : `${customerTotal} ${customerTotal === 1 ? 'customer' : 'customers'}`}</strong></div>
        <label className="customer-search"><Search size={17} /><span className="sr-only">Search customers</span><input type="search" value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} placeholder="Search name, email, or phone" /></label>
        {customersError && <p className="form-message error" role="alert">{customersError}</p>}
        {customersLoading && customers.length === 0 ? <p className="manager-status" role="status"><LoaderCircle className="spin" /> Loading customer records…</p> : customersError && customers.length === 0 ? null : visibleCustomers.length === 0 ? <p className="customer-empty" role="status">{customerSearch ? 'No customers match that search.' : 'No customer accounts yet.'}</p> : <div className="admin-customer-list" role="list">{visibleCustomers.map((customer) => <article key={customer.id} role="listitem"><div className="customer-avatar" aria-hidden="true">{customer.name.trim().charAt(0).toUpperCase() || 'F'}</div><div className="customer-identity"><strong>{customer.name}</strong><span>Email verified</span></div><a href={`mailto:${customer.email}`}><Mail size={15} />{customer.email}</a><a href={`tel:${customer.phone}`}><Phone size={15} />{customer.phone}</a><small>Joined {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(customer.created_at))}</small></article>)}</div>}
        {customers.length < customerTotal && <button className="admin-text-button customer-more" onClick={loadMoreCustomers} disabled={customersLoading}>{customersLoading ? <LoaderCircle size={16} className="spin" /> : null}{customersLoading ? 'Loading…' : 'Load more customers'}</button>}
      </section>
    </main>
  )
}

function AdminLogin({ onLogin, dark, onToggleTheme }: { onLogin: (credentials: AdminCredentials) => void; dark: boolean; onToggleTheme: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const usernameRef = useRef<HTMLInputElement>(null)
  useEffect(() => { usernameRef.current?.focus() }, [])

  const login = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const credentials = await loginAdmin(username, password)
      onLogin(credentials)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Could not sign in.')
    } finally {
      setLoading(false)
    }
  }

  return <main className="login-page"><button className="admin-theme" onClick={onToggleTheme}>{dark ? 'Light mode' : 'Dark mode'}</button><form className="login-card" onSubmit={login}><div className="brand login-brand"><span className="brand-mark">F</span><span><strong>FOODIO</strong><br />ADMIN STUDIO</span></div><span className="eyebrow">Private access</span><h1>Welcome back.</h1><p>Sign in to manage Foodio pickup points.</p><label>Username<input ref={usernameRef} autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} disabled={loading} /></label><label>Password<span className="password-field"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={loading} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} disabled={loading}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>{error && <p className="login-error" role="alert">{error}</p>}<button className="primary-button login-submit" disabled={loading || !username || !password}>{loading ? <><LoaderCircle className="spin" size={18} /> Signing in…</> : <><Check size={18} /> Sign in</>}</button><a href="/">← Back to Foodio</a></form></main>
}
