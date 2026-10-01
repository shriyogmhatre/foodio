import { useState } from 'react'
import { menu, type MenuItem } from '../data'
import { MenuCard } from './MenuCard'

type Category = 'all' | MenuItem['category']

export function MenuSection({ onAdd }: { onAdd: (item: MenuItem) => void }) {
  const [category, setCategory] = useState<Category>('all')
  const categories: { id: Category; label: string }[] = [
    { id: 'all', label: 'All plates' },
    { id: 'shawarma', label: 'Shawarma' },
    { id: 'plates', label: 'Big plates' },
    { id: 'sides', label: 'Sides' },
  ]
  const filtered = category === 'all' ? menu : menu.filter((item) => item.category === category)

  return (
    <section className="menu-section" id="menu">
      <div className="section-heading">
        <div><span className="section-number">01</span><h2>What are you craving?</h2></div>
        <p>Small menu. Big flavour. Everything is made fresh, so it travels beautifully to your pickup point.</p>
      </div>
      <div className="filters" role="group" aria-label="Filter menu">
        {categories.map((item) => (
          <button key={item.id} className={category === item.id ? 'active' : ''} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>
        ))}
      </div>
      <div className="menu-grid">
        {filtered.map((item) => <MenuCard key={item.id} item={item} onAdd={onAdd} />)}
      </div>
    </section>
  )
}
