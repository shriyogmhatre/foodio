import { ArrowDown, Clock3, Flame } from 'lucide-react'

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <span className="eyebrow"><Flame size={14} /> Wrapped fresh. Picked up close.</span>
        <h1>Good food.<br /><em>No long wait.</em></h1>
        <p className="hero-lede">Shawarma with a point of view—charred to order, wrapped by hand, and waiting at your nearest neighbourhood pickup spot.</p>
        <div className="hero-actions">
          <a className="primary-button" href="#menu">Explore the menu <ArrowDown size={18} /></a>
          <span className="prep-time"><Clock3 size={18} /> Ready in 12–20 min</span>
        </div>
      </div>
      <div className="hero-art" aria-label="Fresh shawarma wrap with vegetables">
        <div className="sun-shape" />
        <img src="https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1100&q=90" alt="Freshly made chicken shawarma wrap" />
        <span className="scribble scribble-one">↓ made to order</span>
        <span className="floating-card"><b>4.9</b><small>local favourite</small></span>
      </div>
    </section>
  )
}
