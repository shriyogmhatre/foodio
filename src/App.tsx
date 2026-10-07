import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Camera, MapPin } from 'lucide-react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { MenuSection } from './components/MenuSection'
import { PickupMap } from './components/PickupMap'
import { StorySection } from './components/StorySection'
import { CartDrawer, type CartLine } from './components/CartDrawer'
import { defaultPickupPoints, type MenuItem, type PickupPoint } from './data'
import { loadPickupPoints } from './pickup-api'
import { AdminPage } from './components/AdminPage'
import { ProcessSection } from './components/ProcessSection'
import { Experience } from './components/Experience'

export function App() {
  if (window.location.pathname.startsWith('/admin')) return <AdminPage />

  return <Storefront />
}

function Storefront() {
  const [dark, setDark] = useState(() => localStorage.getItem('foodio-theme') === 'dark')
  const [lines, setLines] = useState<CartLine[]>([])
  const [points, setPoints] = useState(defaultPickupPoints)
  const [pickup, setPickup] = useState<PickupPoint | null>(null)
  const [pickupStatus, setPickupStatus] = useState('Loading live pickup points…')
  const [cartOpen, setCartOpen] = useState(false)
  const [completed, setCompleted] = useState(false)
  const count = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines])
  const mapPickup = pickup ?? points[0] ?? defaultPickupPoints[0]

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('foodio-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    let active = true
    loadPickupPoints()
      .then((next) => {
        if (!active || next.length === 0) return
        setPoints(next)
        setPickup((current) => current ? next.find((point) => point.id === current.id) ?? null : null)
        setPickupStatus('')
      })
      .catch(() => active && setPickupStatus('Live locations are temporarily unavailable. Showing our usual pickup points.'))
    return () => { active = false }
  }, [])

  const addItem = (item: MenuItem) => {
    if (lines.length === 0) setPickup(null)
    setLines((current) => {
      const found = current.find((line) => line.item.id === item.id)
      return found ? current.map((line) => line.item.id === item.id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { item, quantity: 1 }]
    })
    setCompleted(false)
    setCartOpen(true)
  }

  const changeQuantity = (id: string, delta: number) => {
    setLines((current) => current.map((line) => line.item.id === id ? { ...line, quantity: line.quantity + delta } : line).filter((line) => line.quantity > 0))
  }

  const checkout = () => {
    if (!pickup) return
    setCompleted(true)
    setLines([])
  }

  return (
    <>
      <Header dark={dark} cartCount={count} onToggleTheme={() => setDark((value) => !value)} onOpenCart={() => { setCompleted(false); setCartOpen(true) }} />
      <a href="#menu" className="skip-link">Skip to menu</a>
      <main>
        <Hero />
        <div className="marquee" aria-hidden="true"><span>CHARRED FRESH ✦ WRAPPED WITH LOVE ✦ PICKED UP CLOSE ✦ GOOD MOOD FOOD ✦ </span><span>CHARRED FRESH ✦ WRAPPED WITH LOVE ✦ PICKED UP CLOSE ✦ GOOD MOOD FOOD ✦ </span></div>
        <MenuSection onAdd={addItem} />
        <ProcessSection />
        <PickupMap points={points} selected={mapPickup} onSelect={setPickup} statusMessage={pickupStatus} dark={dark} />
        <StorySection />
        <section className="closing-cta"><div className="cta-pin"><MapPin size={18} /> Made in Panvel</div><span>Hot, fresh, close by</span><h2>Your next favourite<br />is waiting.</h2><p>Choose your food. Choose your pickup. We’ll handle the delicious part.</p><a href="#menu" className="primary-button">Build your order <ArrowUpRight /></a></section>
      </main>
      <footer><div className="footer-lead"><div className="brand footer-brand"><span className="brand-mark">F</span><span><strong>FOODIO</strong><br />SHAWARMA STUDIO</span></div><p>Big flavour, timed for pickup.<br />Born and built in Panvel.</p></div><div className="footer-links"><span>Explore</span><a href="#menu">Menu</a><a href="#pickup">Pickup points</a><a href="#story">Our story</a></div><div className="footer-links"><span>Visit</span><a href="/admin">Admin studio</a><a href="mailto:hello@foodio.food">hello@foodio.food</a></div><a className="social" href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Camera /></a><small>© 2026 Foodio · Made fresh in Panvel</small></footer>
      <CartDrawer open={cartOpen} lines={lines} points={points} pickup={pickup} completed={completed} onClose={() => setCartOpen(false)} onChange={changeQuantity} onSelectPickup={setPickup} onCheckout={checkout} />
      <Experience count={count} onBag={() => { setCompleted(false); setCartOpen(true) }} />
      {count > 0 && <button className="mobile-cart" onClick={() => { setCompleted(false); setCartOpen(true) }}><span>View bag · {count} item{count === 1 ? '' : 's'}</span><strong>₹{lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0)}</strong></button>}
    </>
  )
}
