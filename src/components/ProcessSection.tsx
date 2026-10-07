import { ChefHat, MapPinned, ShoppingBag } from 'lucide-react'

const steps = [
  { icon: ShoppingBag, number: '01', title: 'Build your bag', copy: 'Pick a wrap, plate, or side from our tight menu.' },
  { icon: MapPinned, number: '02', title: 'Choose your spot', copy: 'Select a convenient pickup point or let us find the nearest.' },
  { icon: ChefHat, number: '03', title: 'We cook, you collect', copy: 'We time every order so it arrives hot when you do.' },
]

export function ProcessSection() {
  return <section className="process-section" aria-labelledby="process-title"><div className="process-intro"><span className="eyebrow">The Foodio way</span><h2 id="process-title">From craving to collection.</h2><p>No queues, no cold delivery, no guesswork.</p></div><div className="process-grid">{steps.map(({ icon: Icon, number, title, copy }) => <article key={number}><span className="process-number">{number}</span><span className="process-icon"><Icon size={22} /></span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
}
