import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api'
import { LoaderCircle, MapPin } from 'lucide-react'

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''
const baseOptions: google.maps.MapOptions = { streetViewControl: false, mapTypeControl: false, fullscreenControl: false, clickableIcons: false, gestureHandling: 'cooperative' }
const darkStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#24251f' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#b8b8aa' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#24251f' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#3a3b33' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#171b1c' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
]

export function AdminCoordinateMap({ lat, lng, dark, onChange }: { lat: number; lng: number; dark: boolean; onChange: (coordinates: { lat: number; lng: number }) => void }) {
  const { isLoaded, loadError } = useJsApiLoader({ id: 'foodio-google-maps', googleMapsApiKey: apiKey })
  const position = { lat, lng }
  const updateFromEvent = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return
    onChange({ lat: Number(event.latLng.lat().toFixed(6)), lng: Number(event.latLng.lng().toFixed(6)) })
  }

  if (!apiKey || loadError) return <div className="coordinate-map-state error" role="alert"><MapPin /><strong>Google Maps could not load.</strong><span>Enter latitude and longitude manually.</span></div>
  if (!isLoaded) return <div className="coordinate-map-state" role="status"><LoaderCircle className="spin" /><strong>Loading Google Maps…</strong></div>

  return <div className="admin-coordinate-map"><GoogleMap mapContainerClassName="admin-google-map" center={position} zoom={14} options={{ ...baseOptions, styles: dark ? darkStyles : undefined }} onClick={updateFromEvent}><MarkerF position={position} draggable title="Pickup point marker" onDragEnd={updateFromEvent} /></GoogleMap><p>Click the map or drag the marker to set exact coordinates.</p></div>
}
