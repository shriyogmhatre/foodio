import { Check, MapPin, Navigation } from 'lucide-react'
import type { PickupPoint } from '../data'

type PickupMapProps = { points: PickupPoint[]; selected: PickupPoint; onSelect: (point: PickupPoint) => void }

export function PickupMap({ points, selected, onSelect }: PickupMapProps) {
  return (
    <section className="pickup-section" id="pickup">
      <div className="pickup-panel">
        <span className="section-number">02</span>
        <h2>Choose where<br />we meet.</h2>
        <p>Your meal is cooked at our studio and timed to arrive warm at the pickup spot you choose.</p>
        <div className="pickup-list" role="radiogroup" aria-label="Choose a pickup point">
          {points.map((point) => (
            <button key={point.id} className={selected.id === point.id ? 'selected' : ''} role="radio" aria-checked={selected.id === point.id} onClick={() => onSelect(point)}>
              <span className="point-icon">{selected.id === point.id ? <Check size={17} /> : <MapPin size={17} />}</span>
              <span><strong>{point.name}</strong><small>{point.address}</small></span>
              <span className="point-meta"><b>{point.time}</b><small>{point.distance}</small></span>
            </button>
          ))}
        </div>
      </div>
      <div className="map-canvas" aria-label="Map showing three pickup points in Bengaluru">
        <div className="map-grid" />
        <span className="road road-one" /><span className="road road-two" /><span className="road road-three" /><span className="road road-four" />
        <span className="map-label label-one">KORAMANGALA</span><span className="map-label label-two">INDIRANAGAR</span><span className="map-label label-three">HSR LAYOUT</span>
        {points.map((point) => (
          <button key={point.id} className={`map-pin ${selected.id === point.id ? 'active' : ''}`} style={{ left: `${point.x}%`, top: `${point.y}%` }} onClick={() => onSelect(point)} aria-label={`Select ${point.name}`}>
            <MapPin size={22} fill="currentColor" />
          </button>
        ))}
        <button className="locate-button" aria-label="Use my current location"><Navigation size={18} /> Locate me</button>
        <div className="map-selection"><span>Picking up at</span><strong>{selected.name}</strong><small>{selected.time} prep · {selected.distance} away</small></div>
      </div>
    </section>
  )
}
