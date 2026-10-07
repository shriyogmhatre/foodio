import { ArrowUpRight, Heart, Leaf, Sparkles } from 'lucide-react'

export function StorySection() {
  return (
    <section className="story-section" id="story">
      <div className="story-image"><img src="https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1100&q=85" alt="Chef preparing food in the studio kitchen" loading="lazy" /><span>Est. Panvel<br />2026</span><div className="story-caption"><small>Inside the studio</small><strong>Small batches.<br />Full attention.</strong></div></div>
      <div className="story-copy">
        <span className="section-number">03</span><span className="section-kicker">Our story</span>
        <h2>A little studio.<br />A lot of flavour.</h2>
        <p>We treat every wrap like a tiny edible project: thoughtfully sourced, obsessively balanced, and made in small batches throughout the day.</p>
        <div className="values">
          <div><Leaf /><span><strong>Fresh daily</strong><small>No freezers, no shortcuts.</small></span></div>
          <div><Sparkles /><span><strong>Made with intent</strong><small>Recipes built from scratch.</small></span></div>
          <div><Heart /><span><strong>Neighbourhood first</strong><small>Pickup spots close to you.</small></span></div>
        </div>
        <a className="text-link story-link" href="#menu">Taste the difference <ArrowUpRight size={17} /></a>
      </div>
    </section>
  )
}
