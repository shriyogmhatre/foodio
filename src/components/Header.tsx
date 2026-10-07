import { useEffect, useRef, useState } from 'react'
import { Menu, Moon, ShoppingBag, Sun, X } from 'lucide-react'

type HeaderProps = {
  dark: boolean
  cartCount: number
  onToggleTheme: () => void
  onOpenCart: () => void
}

export function Header({ dark, cartCount, onToggleTheme, onOpenCart }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    firstLinkRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#top" aria-label="Foodio home">
          <span className="brand-mark">F</span>
          <span><strong>FOODIO</strong><br />SHAWARMA STUDIO</span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#menu">Menu</a>
          <a href="#pickup">Pickup</a>
          <a href="#story">Our story</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button" onClick={onToggleTheme} aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="cart-button" onClick={onOpenCart}>
            <ShoppingBag size={18} />
            <span>Bag</span>
            <span className="cart-count" aria-label={`${cartCount} items`}>{cartCount}</span>
          </button>
          <button className="mobile-menu-button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {menuOpen && <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation"><a ref={firstLinkRef} href="#menu" onClick={() => setMenuOpen(false)}>Menu <span>01</span></a><a href="#pickup" onClick={() => setMenuOpen(false)}>Pickup <span>02</span></a><a href="#story" onClick={() => setMenuOpen(false)}>Our story <span>03</span></a></nav>}
    </header>
  )
}
