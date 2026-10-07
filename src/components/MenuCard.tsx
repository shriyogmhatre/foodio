import { ArrowUpRight, Plus } from 'lucide-react'
import type { MenuItem } from '../data'

type MenuCardProps = { item: MenuItem; onAdd: (item: MenuItem) => void }

export function MenuCard({ item, onAdd }: MenuCardProps) {
  return (
    <article className="menu-card">
      <div className="card-image-wrap">
        <img src={item.image} alt={item.name} loading="lazy" />
        {item.badge && <span className="food-badge">{item.badge}</span>}
        <span className="card-category">{item.category === 'plates' ? 'Big plate' : item.category === 'sides' ? 'Side' : 'Shawarma'}</span>
      </div>
      <div className="card-content">
        <div>
          <div className="card-title"><h3>{item.name}</h3><ArrowUpRight size={19} /></div>
          <p>{item.description}</p>
        </div>
        <div className="card-footer">
          <span><strong>₹{item.price}</strong><small>tax included</small></span>
          <button onClick={() => onAdd(item)} aria-label={`Add ${item.name} to bag`}><Plus size={18} /> Add</button>
        </div>
      </div>
    </article>
  )
}
