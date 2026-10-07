import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './free-map.css'

type Position = { lat: number; lng: number }
type Props = { center: Position; points: (Position & { id: string; name: string })[]; selectedId: string; dark: boolean; onSelect?: (id: string) => void; onChange?: (position: Position) => void; userPosition?: Position | null; label: string }
export function FreeMap({ center, points, selectedId, dark, onSelect, onChange, userPosition, label }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const initial = useRef(center)
  const focusedPin = useRef<string | null>(null)
  const callbacks = useRef({ onSelect, onChange })
  const [visible, setVisible] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => { callbacks.current = { onSelect, onChange } }, [onSelect, onChange])
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } })
    if (host.current) observer.observe(host.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (!visible || !host.current) return
    const instance = L.map(host.current, { scrollWheelZoom: false }).setView(initial.current, 15)
    map.current = instance
    L.tileLayer(import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, updateWhenIdle: true, keepBuffer: 1, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(instance).on('tileerror', () => setFailed(true))
    instance.on('click', (event: L.LeafletMouseEvent) => callbacks.current.onChange?.({ lat: Number(event.latlng.lat.toFixed(6)), lng: Number(event.latlng.lng.toFixed(6)) }))
    const resize = new ResizeObserver(() => instance.invalidateSize())
    resize.observe(host.current)
    return () => { resize.disconnect(); instance.remove(); map.current = null }
  }, [visible])
  const { lat, lng } = center
  useEffect(() => { map.current?.panTo({ lat, lng }, { animate: false }) }, [lat, lng, visible])
  useEffect(() => {
    if (!map.current) return
    const markers = points.map((point, index) => {
      const selected = point.id === selectedId
      const marker = L.marker(point, { title: point.name, alt: point.name, keyboard: true, draggable: Boolean(onChange), icon: L.divIcon({ className: `foodio-map-pin${selected ? ' is-selected' : ''}`, html: `<span>${index + 1}</span>`, iconSize: [40, 40], iconAnchor: [20, 40] }), zIndexOffset: selected ? 1000 : 0 }).addTo(map.current!)
      marker.on('click', () => callbacks.current.onSelect?.(point.id))
      const element = marker.getElement()
      element?.setAttribute('aria-label', point.name)
      if (focusedPin.current === point.id) { element?.focus({ preventScroll: true }); focusedPin.current = null }
      element?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); callbacks.current.onSelect?.(point.id) }
      })
      marker.on('dragend', () => { const pos = marker.getLatLng(); callbacks.current.onChange?.({ lat: Number(pos.lat.toFixed(6)), lng: Number(pos.lng.toFixed(6)) }) })
      return marker
    })
    const location = userPosition ? L.circleMarker(userPosition, { radius: 9, color: '#fff', fillColor: '#2875ed', fillOpacity: 1 }).addTo(map.current) : null
    return () => {
      const focused = markers.findIndex((marker) => marker.getElement() === document.activeElement)
      if (focused >= 0) focusedPin.current = points[focused].id
      markers.forEach((marker) => marker.remove()); location?.remove()
    }
  }, [points, selectedId, onChange, userPosition, visible])
  return <div className={`free-map-shell${dark ? ' free-map-dark' : ''}`}><div ref={host} className="free-map" role="region" aria-label={label} />{failed && <p className="free-map-error" role="alert">Map tiles could not load. {onChange ? 'Enter coordinates in the fields above.' : 'Choose a pickup point from the list.'}</p>}</div>
}
