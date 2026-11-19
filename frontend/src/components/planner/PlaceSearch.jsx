import { MapPin, Search, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { searchPlaces } from '../../services/api'
import { useLanguage } from '../../services/language'

export default function PlaceSearch({ label, placeholder, selected, excluded, onSelect, onClear, disabled }) {
  const { t, placeName, districtName } = useLanguage()
  const id = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState({ query: null, places: [], failed: false })

  useEffect(() => {
    if (!open || selected || disabled) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const places = await searchPlaces(query.trim(), controller.signal)
        if (!controller.signal.aborted) setSearch({ query, places, failed: false })
      } catch {
        if (!controller.signal.aborted) setSearch({ query, places: [], failed: true })
      }
    }, 180)
    return () => { clearTimeout(timer); controller.abort() }
  }, [query, open, selected, disabled])

  const available = search.places.filter(place => !excluded.includes(place.id))
  return <div className="place-search" onBlur={e => {
    if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
  }} onKeyDown={e => {
    if (e.key === 'Escape' && open) {
      e.currentTarget.querySelector('input')?.focus()
      setOpen(false)
    }
  }}>
    {selected ?
      <div className="input selected" aria-label={label}>
        <MapPin size={18} aria-hidden="true" /><span>{placeName(selected)}</span>
        <button type="button" className="icon-button" onClick={onClear} disabled={disabled} aria-label={t('Clear starting point', 'ล้างจุดเริ่มต้น')}><X size={17} /></button>
      </div> :
      <div className="input search-input">
        <Search size={18} aria-hidden="true" />
        <input aria-label={label} aria-controls={open ? id : undefined} placeholder={placeholder} maxLength={100}
          disabled={disabled} value={query} onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)} onChange={e => { setQuery(e.target.value); setOpen(true) }} />
      </div>}
    {open && !selected && !disabled && <div className="search-panel" id={id}>
      {search.query !== query ? <p role="status">{t('Searching…', 'กำลังค้นหา…')}</p>
        : search.failed ? <p role="alert">{t('Search unavailable. Reopen the field to retry.', 'ค้นหาไม่ได้ เปิดช่องค้นหาอีกครั้งเพื่อลองใหม่')}</p>
        : available.length === 0 ? <p role="status">{t('No matching places available.', 'ไม่พบสถานที่ที่ตรงกัน')}</p>
        : <ul>{available.map(place => <li key={place.id}>
          <button type="button" onClick={() => {
            onSelect(place); setQuery(''); setOpen(false)
          }}>
            <MapPin size={17} aria-hidden="true" /><span><strong>{placeName(place)}</strong><small>{districtName(place)}</small></span>
          </button>
        </li>)}</ul>}
    </div>}
  </div>
}
