import { Moon, ShoppingBag, Sun } from 'lucide-react'

type HeaderProps = {
  dark: boolean
  cartCount: number
  onToggleTheme: () => void
  onOpenCart: () => void
}

export function Header({ dark, cartCount, onToggleTheme, onOpenCart }: HeaderProps) {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Foodio home">
        <span className="brand-mark">F</span>
        <span><strong>FOODIO</strong><br />SHAWARMA STUDIO</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#menu">Menu</a>
        <a href="#pickup">Pickup</a>
        <a href="#story">Our story</a>
      </nav>
      <div className="header-actions">
        <button className="icon-button" onClick={onToggleTheme} aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}>
          {dark ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <button className="cart-button" onClick={onOpenCart}>
          <ShoppingBag size={19} />
          <span>Bag</span>
          <span className="cart-count" aria-label={`${cartCount} items`}>{cartCount}</span>
        </button>
      </div>
    </header>
  )
}
