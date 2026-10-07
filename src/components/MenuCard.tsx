import { ArrowUpRight, Heart, Plus } from 'lucide-react'
import type { MenuItem } from '../data'

type MenuCardProps = { item: MenuItem; index: number; saved: boolean; onSave: () => void; onDetails: () => void; onAdd: (item: MenuItem) => void }

export function MenuCard({ item, index, saved, onSave, onDetails, onAdd }: MenuCardProps) {
  return (
    <article className="menu-card" style={{ animationDelay: `${index * 55}ms` }}>
      <div className="card-image-wrap">
        <img src={item.image} alt={item.name} loading="lazy" />
        <button className="food-preview" onClick={onDetails} aria-label={`View ${item.name} details`}><span>Explore this bite <ArrowUpRight size={15} /></span></button>
        <button className="save-food" aria-label={`${saved ? 'Unsave' : 'Save'} ${item.name}`} aria-pressed={saved} onClick={onSave}><Heart size={18} fill={saved ? 'currentColor' : 'none'} /></button>
        {item.badge && <span className="food-badge">{item.badge}</span>}
        <span className="card-category">{item.category === 'plates' ? 'Big plate' : item.category === 'sides' ? 'Side' : 'Shawarma'}</span>
      </div>
      <div className="card-content">
        <div>
          <div className="card-title"><h3><button className="food-title-button" onClick={onDetails}>{item.name}</button></h3><ArrowUpRight size={19} /></div>
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
