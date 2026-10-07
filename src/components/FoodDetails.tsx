import { useEffect, useRef } from 'react'
import { ArrowUpRight, Flame, X } from 'lucide-react'
import type { MenuItem } from '../data'

export function FoodDetails({ item, onClose, onAdd }: { item: MenuItem; onClose: () => void; onAdd: (item: MenuItem) => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current!
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    return () => { dialog.close(); document.body.style.overflow = overflow; previous?.focus() }
  }, [])
  return <dialog ref={ref} className="food-details" aria-labelledby="food-details-title" onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}><div className="details-inner"><div className="details-photo"><img src={item.image} alt={item.name} /><button autoFocus className="details-close" onClick={onClose} aria-label="Close food details"><X /></button><span><Flame size={14} /> Made to order</span></div><div className="details-copy"><span className="section-kicker">The Foodio edit · {item.category}</span><h2 id="food-details-title">{item.name}</h2><p>{item.description}</p><div className="ingredient-tags">{item.description.replace(/\.$/, '').split(/, | & /).map((part) => <span key={part}>{part}</span>)}</div><p className="details-note">Choose your pickup point in the bag. Your location is only requested when you ask for a nearby suggestion.</p><button className="primary-button" onClick={() => { onClose(); onAdd(item) }}>Add to bag · ₹{item.price}<ArrowUpRight size={18} /></button></div></div></dialog>
}
