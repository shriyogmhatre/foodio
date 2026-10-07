import { useEffect, useState } from 'react'
import { ArrowUp, Home, MapPin, ShoppingBag, UtensilsCrossed } from 'lucide-react'

export function Experience({ count, onBag }: { count: number; onBag: () => void }) {
  const [section, setSection] = useState('top')
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('main > section')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const reveal = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); reveal.unobserve(entry.target) }
    }), { threshold: 0.08 })
    if (!reduced.matches) sections.forEach((el) => { if (el.id !== 'top') { el.classList.add('reveal-section'); reveal.observe(el) } })
    const active = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target.id) setSection(entry.target.id)
    }), { rootMargin: '-15% 0px -55% 0px' })
    sections.forEach((el) => active.observe(el))
    return () => { reveal.disconnect(); active.disconnect(); sections.forEach((el) => el.classList.remove('reveal-section')) }
  }, [])
  return <><nav className="phone-dock" aria-label="Quick navigation"><a href="#top" aria-current={section === 'top' ? 'location' : undefined}><Home size={20} /><span>Home</span></a><a href="#menu" aria-current={section === 'menu' ? 'location' : undefined}><UtensilsCrossed size={20} /><span>Menu</span></a><a href="#pickup" aria-current={section === 'pickup' ? 'location' : undefined}><MapPin size={20} /><span>Pickup</span></a><button onClick={onBag} aria-label={`Open bag, ${count} items`}><ShoppingBag size={20} /><span>Bag</span>{count > 0 && <b key={count}>{count}</b>}</button></nav>{section !== 'top' && <a className="back-top" href="#top" aria-label="Back to top"><ArrowUp size={20} /></a>}</>
}
