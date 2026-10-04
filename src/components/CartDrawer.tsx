import { useEffect, useRef, useState } from 'react'
import { Check, CheckCircle2, LoaderCircle, LocateFixed, MapPin, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import type { MenuItem, PickupPoint } from '../data'

export type CartLine = { item: MenuItem; quantity: number }

type CartDrawerProps = {
  open: boolean
  lines: CartLine[]
  points: PickupPoint[]
  pickup: PickupPoint | null
  completed: boolean
  onClose: () => void
  onChange: (id: string, delta: number) => void
  onSelectPickup: (point: PickupPoint) => void
  onCheckout: () => void
}

function distanceKm(latitude: number, longitude: number, point: PickupPoint) {
  const radius = 6371
  const toRadians = (value: number) => value * Math.PI / 180
  const latDelta = toRadians(point.lat - latitude)
  const lngDelta = toRadians(point.lng - longitude)
  const a = Math.sin(latDelta / 2) ** 2 + Math.cos(toRadians(latitude)) * Math.cos(toRadians(point.lat)) * Math.sin(lngDelta / 2) ** 2
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function CartDrawer({ open, lines, points, pickup, completed, onClose, onChange, onSelectPickup, onCheckout }: CartDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const [locating, setLocating] = useState(false)
  const [locationMessage, setLocationMessage] = useState('')
  const subtotal = lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0)

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const suggestNearest = () => {
    if (points.length === 0) { setLocationMessage('No pickup points are available right now.'); return }
    if (!navigator.geolocation) { setLocationMessage('Location is not supported by this browser.'); return }
    setLocating(true); setLocationMessage('Finding the nearest pickup point…')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const ranked = points.map((point) => ({ point, distance: distanceKm(coords.latitude, coords.longitude, point) })).sort((a, b) => a.distance - b.distance)
        const nearest = ranked[0]
        onSelectPickup(nearest.point)
        setLocationMessage(`${nearest.point.name} is nearest to you, about ${nearest.distance < 1 ? `${Math.round(nearest.distance * 1000)} m` : `${nearest.distance.toFixed(1)} km`} away.`)
        setLocating(false)
      },
      (error) => {
        setLocationMessage(error.code === error.PERMISSION_DENIED ? 'Location access was denied. Please choose a pickup point below.' : 'We could not find your location. Please choose a pickup point below.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  if (!open) return null

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="drawer-head"><div><span>Your order</span><h2 id="cart-title">The good stuff.</h2></div><button ref={closeRef} className="icon-button" onClick={onClose} aria-label="Close bag"><X /></button></div>
        {completed ? (
          <div className="success-state"><CheckCircle2 size={56} /><h3>Order confirmed!</h3><p>We’ll have it warm and ready at <strong>{pickup?.name ?? 'your pickup point'}</strong>.</p><button className="primary-button" onClick={onClose}>Done</button></div>
        ) : lines.length === 0 ? (
          <div className="empty-state"><ShoppingBag size={42} /><h3>Your bag is empty.</h3><p>Add a wrap or plate and we’ll get cooking.</p><button className="primary-button" onClick={onClose}>Browse menu</button></div>
        ) : (
          <>
            <div className="cart-lines">
              {lines.map(({ item, quantity }) => (
                <div className="cart-line" key={item.id}>
                  <img src={item.image} alt="" />
                  <div><strong>{item.name}</strong><small>₹{item.price}</small><div className="quantity"><button onClick={() => onChange(item.id, -1)} aria-label={`Remove one ${item.name}`}><Minus size={14} /></button><span>{quantity}</span><button onClick={() => onChange(item.id, 1)} aria-label={`Add one ${item.name}`}><Plus size={14} /></button></div></div>
                  <b>₹{item.price * quantity}</b>
                </div>
              ))}
            </div>
            <section className="cart-pickup" aria-labelledby="cart-pickup-title">
              <div className="cart-pickup-heading"><div><span>Pickup required</span><h3 id="cart-pickup-title">Where should we meet?</h3></div><MapPin size={21} /></div>
              <button className="nearest-button" type="button" onClick={suggestNearest} disabled={locating || points.length === 0}>{locating ? <LoaderCircle className="spin" size={17} /> : <LocateFixed size={17} />}{locating ? 'Finding nearest…' : 'Suggest nearest pickup'}</button>
              {locationMessage && <p className="location-message" role="status">{locationMessage}</p>}
              {points.length === 0 ? <p className="pickup-empty" role="alert">Pickup points are temporarily unavailable.</p> : <div className="cart-pickup-list" role="radiogroup" aria-label="Choose your pickup point">{points.map((point) => <button type="button" key={point.id} role="radio" aria-checked={pickup?.id === point.id} className={pickup?.id === point.id ? 'selected' : ''} onClick={() => { onSelectPickup(point); setLocationMessage('') }}><span className="cart-pickup-icon">{pickup?.id === point.id ? <Check size={15} /> : <MapPin size={15} />}</span><span><strong>{point.name}</strong><small>{point.address} · Ready in {point.time}</small></span></button>)}</div>}
            </section>
            <div className="checkout-block"><div><span>Subtotal</span><strong>₹{subtotal}</strong></div><small id="pickup-required-message">{pickup ? `Pickup: ${pickup.name} · No pickup fee.` : 'Choose a pickup point to continue.'}</small><button className="primary-button checkout-button" onClick={onCheckout} disabled={!pickup || points.length === 0} aria-describedby="pickup-required-message">{pickup ? `Place pickup order · ₹${subtotal}` : 'Choose a pickup point'}</button></div>
          </>
        )}
      </aside>
    </div>
  )
}
