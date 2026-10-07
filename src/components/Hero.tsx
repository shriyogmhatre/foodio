import { ArrowDown, Clock3, Flame, MapPin, Sparkles } from 'lucide-react'

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <span className="eyebrow hero-eyebrow"><Flame size={14} /> Panvel's neighbourhood shawarma studio</span>
        <h1>Good food.<br /><em>Great mood.</em><span className="hero-spark" aria-hidden="true">✳</span></h1>
        <p className="hero-lede">Shawarma charred to order, wrapped by hand, and timed to meet you at a pickup point nearby.</p>
        <div className="hero-actions">
          <a className="primary-button" href="#menu">Order your favourite <ArrowDown size={18} /></a>
          <a className="text-link" href="#pickup"><MapPin size={17} /> Find a pickup point</a>
        </div>
        <div className="hero-proof" aria-label="Foodio service highlights"><span><strong>Panvel</strong><small><MapPin size={12} /> made local</small></span><span><strong>12–20</strong><small><Clock3 size={12} /> minutes prep</small></span><span><strong>Fresh</strong><small><Sparkles size={12} /> every order</small></span></div>
      </div>
      <div className="hero-art" aria-label="Fresh shawarma wrap with vegetables">
        <div className="hero-orbit" aria-hidden="true" />
        <div className="sun-shape" aria-hidden="true" />
        <img src="https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1100&q=90" alt="Freshly made chicken shawarma wrap" />
        <span className="scribble scribble-one">made fresh ↓</span>
        <span className="floating-card"><Flame size={18} /><b>Charred</b><small>to order</small></span>
        <span className="hero-location-card"><MapPin size={18} /><span><small>Find us around</small><strong>Vadale Lake</strong></span></span>
        <span className="hero-wordmark" aria-hidden="true">WRAP. EAT. REPEAT.</span>
      </div>
    </section>
  )
}
