import { FreeMap } from './FreeMap'
export function AdminCoordinateMap({ lat, lng, dark, onChange }: { lat: number; lng: number; dark: boolean; onChange: (coordinates: { lat: number; lng: number }) => void }) {
  return <div className="admin-coordinate-map"><FreeMap center={{ lat, lng }} points={[{ id: 'pickup', name: 'Pickup point marker', lat, lng }]} selectedId="pickup" dark={dark} onChange={onChange} label="Choose pickup coordinates on the map" /><p>Click the map or drag the marker to set coordinates. For keyboard entry, use the latitude and longitude fields above.</p></div>
}
