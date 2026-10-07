import { useEffect, useState } from 'react'
import { Heart, Search, SlidersHorizontal, X } from 'lucide-react'
import { menu, type MenuItem } from '../data'
import { MenuCard } from './MenuCard'
import { FoodDetails } from './FoodDetails'

type Category = 'all' | MenuItem['category']
export function MenuSection({ onAdd }: { onAdd: (item: MenuItem) => void }) {
  const [category, setCategory] = useState<Category>('all')
  const [query, setQuery] = useState('')
  const [savedOnly, setSavedOnly] = useState(false)
  const [sort, setSort] = useState('recommended')
  const [details, setDetails] = useState<MenuItem | null>(null)
  const [saved, setSaved] = useState<string[]>(() => {
    try { const value: unknown = JSON.parse(localStorage.getItem('foodio-favourites') ?? '[]'); return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [] } catch { return [] }
  })
  useEffect(() => { try { localStorage.setItem('foodio-favourites', JSON.stringify(saved)) } catch { /* Browsing still works without storage. */ } }, [saved])
  const categories: { id: Category; label: string; symbol: string }[] = [
    { id: 'all', label: 'All cravings', symbol: '✦' }, { id: 'shawarma', label: 'Shawarma', symbol: '↗' },
    { id: 'plates', label: 'Big plates', symbol: '◉' }, { id: 'sides', label: 'Sides', symbol: '+' },
  ]
  const filtered = menu.filter((item) => (category === 'all' || item.category === category) && (!savedOnly || saved.includes(item.id)) && `${item.name} ${item.description}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : 0)
  return <section className="menu-section" id="menu">
    <div className="section-heading"><div><span className="section-number">01</span><span className="section-kicker">Find your flavour</span><h2>Love at<br /><em>first bite.</em></h2></div><p>Find your usual. Discover a new favourite.<br />Your next good mood starts here.</p></div>
    <div className="menu-tools"><label className="menu-search"><Search size={18} /><span className="sr-only">Search the menu</span><input type="search" placeholder="A wrap? Falafel? Something spicy?" value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}</label><button className="saved-filter" aria-pressed={savedOnly} onClick={() => setSavedOnly(!savedOnly)}><Heart size={17} fill={savedOnly ? 'currentColor' : 'none'} /> Saved <span>{saved.length}</span></button></div>
    <div className="menu-controls"><div className="filters" role="group" aria-label="Filter menu">{categories.map((item) => <button key={item.id} className={category === item.id ? 'active' : ''} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}><span aria-hidden="true">{item.symbol}</span> {item.label}</button>)}</div><label className="menu-sort"><SlidersHorizontal size={15} /><span className="sr-only">Sort menu</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="recommended">Our picks</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div>
    <p className="menu-result" role="status">{filtered.length} delicious option{filtered.length === 1 ? '' : 's'}{savedOnly ? ' in your favourites' : ' · made for your mood'}</p>
    {filtered.length ? <div className="menu-grid" key={`${category}-${savedOnly}-${sort}`}>{filtered.map((item, index) => <MenuCard key={item.id} item={item} index={index} saved={saved.includes(item.id)} onSave={() => setSaved((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} onDetails={() => setDetails(item)} onAdd={onAdd} />)}</div> : <div className="menu-empty"><Search size={32} /><h3>No bites found. Yet.</h3><p>Try another ingredient or explore the whole menu.</p><button className="primary-button" onClick={() => { setQuery(''); setCategory('all'); setSavedOnly(false) }}>Show all food</button></div>}
    {details && <FoodDetails item={details} onClose={() => setDetails(null)} onAdd={onAdd} />}
  </section>
}
