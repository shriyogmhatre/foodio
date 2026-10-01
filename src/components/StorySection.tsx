import { Heart, Leaf, Sparkles } from 'lucide-react'

export function StorySection() {
  return (
    <section className="story-section" id="story">
      <div className="story-image"><img src="https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1100&q=85" alt="Chef preparing food in the studio kitchen" loading="lazy" /><span>Est. Panvel<br />2026</span></div>
      <div className="story-copy">
        <span className="section-number">03</span>
        <h2>A kitchen with<br />creative energy.</h2>
        <p>We treat every wrap like a tiny edible project: thoughtfully sourced, obsessively balanced, and made in small batches throughout the day.</p>
        <div className="values">
          <div><Leaf /><span><strong>Fresh daily</strong><small>No freezers, no shortcuts.</small></span></div>
          <div><Sparkles /><span><strong>Made with intent</strong><small>Recipes built from scratch.</small></span></div>
          <div><Heart /><span><strong>Neighbourhood first</strong><small>Pickup spots close to you.</small></span></div>
        </div>
      </div>
    </section>
  )
}
