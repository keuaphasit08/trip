import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { AlertCircle, MapPin } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { useLanguage } from '../../services/language'

const center = [13.749, 100.513]
const tileUrl = import.meta.env.VITE_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

export default function TripMap({ places, isRoute = false, geometry }) {
  const container = useRef(null)
  const instance = useRef(null)
  const overlay = useRef(null)
  const [tileError, setTileError] = useState(false)
  const { t, lang } = useLanguage()
  const zoomIn = t('Zoom in', 'ขยายแผนที่')
  const zoomOut = t('Zoom out', 'ย่อแผนที่')

  useEffect(() => {
    const map = L.map(container.current, { scrollWheelZoom: false, zoomControl: false }).setView(center, 13)
    L.control.zoom({ position: 'bottomright', zoomInTitle: zoomIn, zoomOutTitle: zoomOut }).addTo(map)
    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).on('tileerror', () => setTileError(true)).on('tileload', () => setTileError(false)).addTo(map)
    instance.current = map
    overlay.current = L.layerGroup().addTo(map)
    const resize = new ResizeObserver(() => map.invalidateSize({ pan: false }))
    resize.observe(container.current)
    return () => { resize.disconnect(); map.remove() }
  }, [zoomIn, zoomOut])

  useEffect(() => {
    const map = instance.current
    const layer = overlay.current
    layer.clearLayers()
    const points = places.map(({ place }) => [place.lat, place.lng])
    const line = geometry?.length > 1 ? geometry : points
    if (line.length > 1) L.polyline(line, {
      color: '#176450', weight: 4, dashArray: geometry ? undefined : '7 8',
    }).addTo(layer)
    for (const { place, index } of places) {
      const name = lang === 'th' ? place.name_th : place.name
      const label = document.createElement('span')
      label.textContent = name
      const marker = L.marker([place.lat, place.lng], {
        icon: L.divIcon({
          className: index === 0 ? 'map-marker map-start' : 'map-marker',
          html: index === 0 ? '●' : String(index), iconSize: [32, 32], iconAnchor: [16, 16],
        }),
        title: name,
      }).bindPopup(label).addTo(layer)
      marker.getElement().setAttribute('aria-label', name)
    }
    if (points.length > 1) map.fitBounds([...points, ...line], { padding: [42, 42], maxZoom: 15 })
    else if (points.length === 1) map.setView(points[0], 14)
    else map.setView(center, 13)
  }, [places, geometry, lang])

  return <section className="map-card" aria-label={t('Trip map', 'แผนที่ทริป')}>
    <header><div className="icon-tile"><MapPin size={19} aria-hidden="true" /></div><div>
      <h2>{isRoute ? t('Your route', 'เส้นทางของคุณ') : t('Map preview', 'ดูตัวอย่างแผนที่')}</h2>
      <p>{t('Bangkok, Thailand', 'กรุงเทพมหานคร ประเทศไทย')}</p>
    </div></header>
    <div className="map-wrap">
      <div ref={container} className="map" aria-label={t('Interactive Bangkok map', 'แผนที่กรุงเทพฯ แบบโต้ตอบ')} />
      {tileError && <div className="tile-error" role="status"><AlertCircle size={16} />{t('Base map unavailable.', 'ไม่สามารถโหลดแผนที่พื้นฐานได้')}</div>}
    </div>
    <div className="map-note">
      {places.length === 0 ? t('Add places to see them on the map.', 'เพิ่มสถานที่เพื่อดูบนแผนที่')
        : isRoute && geometry ? t('Scheduled stops in itinerary order.', 'จุดแวะตามลำดับในแผนเที่ยว')
        : t('Dashed lines connect selected places for reference.', 'เส้นประเชื่อมสถานที่ที่เลือกเพื่อใช้ประกอบการดูแผนที่')}
    </div>
  </section>
}
