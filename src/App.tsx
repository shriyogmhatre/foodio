import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Camera } from 'lucide-react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { MenuSection } from './components/MenuSection'
import { PickupMap } from './components/PickupMap'
import { StorySection } from './components/StorySection'
import { CartDrawer, type CartLine } from './components/CartDrawer'
import { defaultPickupPoints, type MenuItem } from './data'
import { loadPickupPoints } from './pickup-api'
import { AdminPage } from './components/AdminPage'

export function App() {
  if (window.location.pathname.startsWith('/admin')) return <AdminPage />

  return <Storefront />
}

function Storefront() {
  const [dark, setDark] = useState(() => localStorage.getItem('foodio-theme') === 'dark')
  const [lines, setLines] = useState<CartLine[]>([])
  const [points, setPoints] = useState(defaultPickupPoints)
  const [pickup, setPickup] = useState(defaultPickupPoints[0])
  const [pickupStatus, setPickupStatus] = useState('Loading live pickup points…')
  const [cartOpen, setCartOpen] = useState(false)
  const [completed, setCompleted] = useState(false)
  const count = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines])

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
        setPickup((current) => next.find((point) => point.id === current.id) ?? next[0])
        setPickupStatus('')
      })
      .catch(() => active && setPickupStatus('Live locations are temporarily unavailable. Showing our usual pickup points.'))
    return () => { active = false }
  }, [])

  const addItem = (item: MenuItem) => {
    setLines((current) => {
      const found = current.find((line) => line.item.id === item.id)
      return found ? current.map((line) => line.item.id === item.id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { item, quantity: 1 }]
    })
  }

  const changeQuantity = (id: string, delta: number) => {
    setLines((current) => current.map((line) => line.item.id === id ? { ...line, quantity: line.quantity + delta } : line).filter((line) => line.quantity > 0))
  }

  const checkout = () => {
    setCompleted(true)
    setLines([])
  }

  return (
    <>
      <Header dark={dark} cartCount={count} onToggleTheme={() => setDark((value) => !value)} onOpenCart={() => { setCompleted(false); setCartOpen(true) }} />
      <main>
        <Hero />
        <div className="marquee" aria-hidden="true"><span>CHARRED FRESH ✦ WRAPPED WITH LOVE ✦ PICKED UP CLOSE ✦ </span><span>CHARRED FRESH ✦ WRAPPED WITH LOVE ✦ PICKED UP CLOSE ✦ </span></div>
        <MenuSection onAdd={addItem} />
        <PickupMap points={points} selected={pickup} onSelect={setPickup} statusMessage={pickupStatus} dark={dark} />
        <StorySection />
        <section className="closing-cta"><span>Still thinking?</span><h2>Your shawarma<br />is waiting.</h2><a href="#menu" className="primary-button">Get yours <ArrowUpRight /></a></section>
      </main>
      <footer><div className="brand footer-brand"><span className="brand-mark">F</span><span><strong>FOODIO</strong><br />SHAWARMA STUDIO</span></div><p>Hot wraps. Cool pickup.<br />Made in Bengaluru.</p><div><a href="#menu">Menu</a><a href="#pickup">Pickup points</a><a href="#story">About</a></div><a className="social" href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Camera /></a><small>© 2026 Foodio</small></footer>
      <CartDrawer open={cartOpen} lines={lines} pickup={pickup} completed={completed} onClose={() => setCartOpen(false)} onChange={changeQuantity} onCheckout={checkout} />
      {count > 0 && <button className="mobile-cart" onClick={() => { setCompleted(false); setCartOpen(true) }}><span>View bag · {count} item{count === 1 ? '' : 's'}</span><strong>₹{lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0)}</strong></button>}
    </>
  )
}
