import { useState } from 'react'
import { FreeMap } from './FreeMap'
import { Check, MapPin, Navigation } from 'lucide-react'
import type { PickupPoint } from '../data'

type PickupMapProps = { points: PickupPoint[]; selected: PickupPoint; onSelect: (point: PickupPoint) => void; statusMessage?: string; dark: boolean }

export function PickupMap({ points, selected, onSelect, statusMessage, dark }: PickupMapProps) {
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [locationMessage, setLocationMessage] = useState('')

  const locate = () => {
    if (!navigator.geolocation) { setLocationMessage('Location is not supported by this browser.'); return }
    setLocationMessage('Finding you…')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = { lat: coords.latitude, lng: coords.longitude }
        setUserPosition(position)
        setLocating(false)
        setLocationMessage('Your location is marked in blue when within this map view. Use the bag for nearby pickup suggestions.')
      },
      () => { setLocating(false); setLocationMessage('We could not access your location. Please choose a pickup point from the list.') },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  return (
    <section className="pickup-section" id="pickup">
      <div className="pickup-panel">
        <div className="pickup-heading-row"><span className="section-number">02</span><span className="pickup-live"><i /> {points.length} live point{points.length === 1 ? '' : 's'}</span></div>
        <span className="section-kicker">Pickup network</span>
        <h2>Choose where<br />we meet.</h2>
        <p>Your meal is cooked at our studio and timed to arrive warm at the pickup spot you choose.</p>
        {statusMessage && <p className="pickup-status" role="status">{statusMessage}</p>}
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
      <div className="map-canvas" aria-label="Foodio pickup map at Vadale Lake, Panvel">
        <FreeMap center={selected} points={points} selectedId={selected.id} dark={dark} userPosition={userPosition} onSelect={(id) => { const point = points.find((item) => item.id === id); if (point) onSelect(point) }} label="Pickup points around Vadale Lake" />
        <button className="locate-button" onClick={locate} disabled={locating} aria-describedby="location-status"><Navigation size={18} /> {locating ? 'Locating…' : 'Locate me'}</button>
        <span id="location-status" className="sr-only" role="status">{locationMessage}</span>
        <div className="map-selection"><span>Selected pickup</span><strong>{selected.name}</strong><small><i /> {selected.time} prep · {selected.distance} away</small></div>
      </div>
    </section>
  )
}
