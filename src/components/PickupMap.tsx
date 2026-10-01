import { useEffect, useRef, useState } from 'react'
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api'
import { Check, LoaderCircle, MapPin, Navigation } from 'lucide-react'
import type { PickupPoint } from '../data'

type PickupMapProps = { points: PickupPoint[]; selected: PickupPoint; onSelect: (point: PickupPoint) => void; statusMessage?: string; dark: boolean }

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''
const lightOptions: google.maps.MapOptions = { disableDefaultUI: true, zoomControl: true, clickableIcons: false, gestureHandling: 'cooperative' }
const darkOptions: google.maps.MapOptions = {
  ...lightOptions,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#24251f' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#b8b8aa' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#24251f' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#3a3b33' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#565844' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#171b1c' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  ],
}

export function PickupMap({ points, selected, onSelect, statusMessage, dark }: PickupMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null)
  const [userPosition, setUserPosition] = useState<google.maps.LatLngLiteral | null>(null)
  const [locationMessage, setLocationMessage] = useState('')
  const { isLoaded, loadError } = useJsApiLoader({ id: 'foodio-google-maps', googleMapsApiKey: apiKey })

  useEffect(() => {
    mapRef.current?.panTo({ lat: selected.lat, lng: selected.lng })
  }, [selected])

  const locate = () => {
    if (!navigator.geolocation) { setLocationMessage('Location is not supported by this browser.'); return }
    setLocationMessage('Finding you…')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = { lat: coords.latitude, lng: coords.longitude }
        setUserPosition(position)
        mapRef.current?.panTo(position)
        mapRef.current?.setZoom(14)
        setLocationMessage('Your location is shown in blue.')
      },
      () => setLocationMessage('We could not access your location.'),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  return (
    <section className="pickup-section" id="pickup">
      <div className="pickup-panel">
        <span className="section-number">02</span>
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
      <div className="map-canvas google-map-shell" aria-label="Google Map showing Foodio pickup points in Bengaluru">
        {!apiKey || loadError ? <div className="map-state error" role="alert"><MapPin /><strong>Map unavailable</strong><span>Choose a pickup point from the list.</span></div> : !isLoaded ? <div className="map-state" role="status"><LoaderCircle className="spin" /><strong>Loading Google Maps…</strong></div> : <GoogleMap mapContainerClassName="google-map" center={{ lat: selected.lat, lng: selected.lng }} zoom={12} options={dark ? darkOptions : lightOptions} onLoad={(map) => { mapRef.current = map }} onUnmount={() => { mapRef.current = null }}>
          {points.map((point, index) => <MarkerF key={point.id} position={{ lat: point.lat, lng: point.lng }} title={point.name} label={{ text: String(index + 1), color: '#ffffff', fontWeight: '700' }} icon={{ url: selected.id === point.id ? 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png' : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' }} onClick={() => onSelect(point)} />)}
          {userPosition && <MarkerF position={userPosition} title="Your location" icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' }} />}
        </GoogleMap>}
        <button className="locate-button" onClick={locate} disabled={!isLoaded || Boolean(loadError)} aria-describedby="location-status"><Navigation size={18} /> Locate me</button>
        <span id="location-status" className="sr-only" role="status">{locationMessage}</span>
        <div className="map-selection"><span>Picking up at</span><strong>{selected.name}</strong><small>{selected.time} prep · {selected.distance} away</small></div>
      </div>
    </section>
  )
}
