import { useEffect, useRef } from 'react'
import { CheckCircle2, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import type { MenuItem, PickupPoint } from '../data'

export type CartLine = { item: MenuItem; quantity: number }

type CartDrawerProps = {
  open: boolean
  lines: CartLine[]
  pickup: PickupPoint
  completed: boolean
  onClose: () => void
  onChange: (id: string, delta: number) => void
  onCheckout: () => void
}

export function CartDrawer({ open, lines, pickup, completed, onClose, onChange, onCheckout }: CartDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
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

  if (!open) return null

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="drawer-head"><div><span>Your order</span><h2 id="cart-title">The good stuff.</h2></div><button ref={closeRef} className="icon-button" onClick={onClose} aria-label="Close bag"><X /></button></div>
        {completed ? (
          <div className="success-state"><CheckCircle2 size={56} /><h3>Order confirmed!</h3><p>We’ll have it warm and ready at <strong>{pickup.name}</strong>.</p><button className="primary-button" onClick={onClose}>Done</button></div>
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
            <div className="pickup-summary"><span>Pickup</span><strong>{pickup.name}</strong><small>{pickup.address} · Ready in {pickup.time}</small></div>
            <div className="checkout-block"><div><span>Subtotal</span><strong>₹{subtotal}</strong></div><small>Taxes included. No pickup fee.</small><button className="primary-button checkout-button" onClick={onCheckout}>Place pickup order · ₹{subtotal}</button></div>
          </>
        )}
      </aside>
    </div>
  )
}
