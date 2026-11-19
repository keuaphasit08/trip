import { ArrowDown, ArrowUp, CalendarDays, Car, Clock3, Footprints, Info, ListOrdered, MapPin, Route, TrainFront, X, Zap } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PlaceSearch from '../components/planner/PlaceSearch'
import TripMap from '../components/planner/TripMap'
import { optimizeTrip } from '../services/api'
import { useLanguage } from '../services/language'

function SectionTitle({ icon: Icon, children }) {
  return <h2 className="section-title"><span className="icon-tile"><Icon size={18} aria-hidden="true" /></span>{children}</h2>
}

export default function Planner({ draft, setDraft, setResult }) {
  const { t, placeName, districtName } = useLanguage()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef(null)
  useEffect(() => () => pending.current?.abort(), [])

  const { start, stops, date, startTime, transport, mode } = draft
  const set = patch => setDraft(current => ({ ...current, ...patch }))
  const selected = useMemo(() => [
    ...(start ? [{ place: start, index: 0 }] : []),
    ...stops.map(({ place }, index) => ({ place, index: index + 1 })),
  ], [start, stops])
  const stopIds = stops.map(({ place }) => place.id)
  const options = [
    ['car', Car, t('Car', 'รถยนต์')], ['transit', TrainFront, t('Public transit', 'ขนส่งสาธารณะ')],
    ['walk', Footprints, t('Walking', 'เดิน')],
  ]

  function reorder(index, offset) {
    const next = stops.slice()
    const [stop] = next.splice(index, 1)
    next.splice(index + offset, 0, stop)
    set({ stops: next })
  }

  async function generate(event) {
    event.preventDefault()
    if (pending.current) return
    if (!start || !stops.length) {
      setError('required')
      return
    }
    const controller = new AbortController()
    pending.current = controller
    setLoading(true)
    setError('')
    try {
      const result = await optimizeTrip({
        mode, transport, date, start_time: startTime, start_place_id: start.id,
        destinations: stops.map(({ place, duration }) => ({
          place_id: place.id, duration_minutes: Number(duration),
        })),
      }, controller.signal)
      if (controller.signal.aborted) return
      setResult(result)
      navigate('/trip')
    } catch (error) {
      if (!controller.signal.aborted) setError(error.code || 'apiError')
    } finally {
      pending.current = null
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  return <main className="shell workspace-page">
    <div className="page-heading">
      <div className="eyebrow"><MapPin size={16} aria-hidden="true" />{t('BANGKOK, THAILAND', 'กรุงเทพมหานคร ประเทศไทย')}</div>
      <h1>{t('Plan your trip', 'วางแผนทริปของคุณ')}</h1>
      <p>{t('Choose where to go and when to leave. TripFlow will arrange your stops.', 'เลือกสถานที่และเวลาออกเดินทาง แล้วให้ TripFlow ช่วยเรียงจุดแวะ')}</p>
    </div>
    <div className="workspace-grid">
      <form className="planner-form" onSubmit={generate}>
        <fieldset disabled={loading}>
          <section className="panel">
            <SectionTitle icon={MapPin}>{t('Starting point', 'จุดเริ่มต้น')}</SectionTitle>
            <PlaceSearch label={t('Starting point', 'จุดเริ่มต้น')} placeholder={t('Search for a starting point', 'ค้นหาจุดเริ่มต้น')}
              selected={start} excluded={stopIds} onSelect={place => set({ start: place })} onClear={() => set({ start: null })} disabled={loading} />
          </section>
          <section className="panel">
            <SectionTitle icon={ListOrdered}>{t('Destinations', 'จุดหมาย')}</SectionTitle>
            {!!stops.length && <ol className="stop-list">{stops.map(({ place, duration }, index) => <li key={place.id}>
              <span className="stop-number" aria-hidden="true">{index + 1}</span>
              <div className="stop-name"><strong>{placeName(place)}</strong><small>{districtName(place)}</small></div>
              <label className="duration"><input type="number" required min="1" max="720" value={duration}
                aria-label={t(`Visit minutes for ${placeName(place)}`, `เวลาเที่ยว (นาที) ที่ ${placeName(place)}`)}
                onChange={e => set({ stops: stops.map((stop, i) => index === i ? { ...stop, duration: e.target.value } : stop) })} /><span>{t('min', 'นาที')}</span></label>
              <div className="stop-actions">
                <button className="icon-button" type="button" disabled={index === 0} onClick={() => reorder(index, -1)} aria-label={t(`Move ${placeName(place)} up`, `เลื่อน ${placeName(place)} ขึ้น`)}><ArrowUp size={16} /></button>
                <button className="icon-button" type="button" disabled={index === stops.length - 1} onClick={() => reorder(index, 1)} aria-label={t(`Move ${placeName(place)} down`, `เลื่อน ${placeName(place)} ลง`)}><ArrowDown size={16} /></button>
                <button className="icon-button remove" type="button" onClick={() => set({ stops: stops.filter((_, i) => i !== index) })} aria-label={t(`Remove ${placeName(place)}`, `ลบ ${placeName(place)}`)}><X size={17} /></button>
              </div>
            </li>)}</ol>}
            <PlaceSearch label={t('Add destination', 'เพิ่มจุดหมาย')} placeholder={t('Search for a destination', 'ค้นหาจุดหมาย')}
              excluded={[start?.id, ...stopIds]} disabled={loading || stops.length >= 12}
              onSelect={place => set({ stops: [...stops, { place, duration: place.suggested_duration }] })} />
            {!stops.length && <p className="hint">{t('Try Wat Pho or the Grand Palace.', 'ลองค้นหาวัดโพธิ์หรือพระบรมมหาราชวัง')}</p>}
          </section>
          <section className="panel">
            <SectionTitle icon={CalendarDays}>{t('Departure', 'ออกเดินทาง')}</SectionTitle>
            <div className="form-grid">
              <label>{t('Trip date', 'วันที่เดินทาง')}<input className="input" type="date" required min="1900-01-01" max="9998-12-31" value={date} onChange={e => set({ date: e.target.value })} /></label>
              <label>{t('Start time', 'เวลาเริ่ม')}<input className="input" type="time" required value={startTime} onChange={e => set({ startTime: e.target.value })} /></label>
            </div>
            <p className="hint">{t('Times are local to Bangkok (UTC+7).', 'ใช้เวลาท้องถิ่นกรุงเทพฯ (UTC+7)')}</p>
            <fieldset className="option-group"><legend>{t('Transport', 'วิธีเดินทาง')}</legend>
              <div className="transport-options">{options.map(([value, Icon, label]) => <label className="choice" key={value}>
                <input type="radio" name="transport" value={value} checked={transport === value} onChange={() => set({ transport: value })} />
                <Icon size={18} aria-hidden="true" />{label}
              </label>)}</div>
            </fieldset>
          </section>
          <section className="panel">
            <SectionTitle icon={Route}>{t('Planning mode', 'โหมดวางแผน')}</SectionTitle>
            <fieldset className="mode-options" aria-label={t('Planning mode', 'โหมดวางแผน')}>
              <label className="choice"><input type="radio" name="mode" checked={mode === 'smart'} onChange={() => set({ mode: 'smart' })} />
                <Clock3 size={19} aria-hidden="true" /><span><strong>{t('Smart schedule', 'ตารางอัจฉริยะ')}</strong><small>{t('Fits visits within opening hours.', 'จัดเวลาเที่ยวให้อยู่ในช่วงเปิด')}</small></span></label>
              <label className="choice"><input type="radio" name="mode" checked={mode === 'fastest'} onChange={() => set({ mode: 'fastest' })} />
                <Zap size={19} aria-hidden="true" /><span><strong>{t('Fastest route', 'เส้นทางเร็วที่สุด')}</strong><small>{t('Looks for shorter travel times. Hours aren’t checked.', 'หาเส้นทางที่เดินทางสั้นลง โดยไม่ตรวจเวลาเปิด')}</small></span></label>
            </fieldset>
          </section>
          {error && <p role="alert" className="error">{{
            required: t('Choose a starting point and at least one destination.', 'เลือกจุดเริ่มต้นและจุดหมายอย่างน้อยหนึ่งแห่ง'),
            invalid: t('Check the date, time, and selected places, then try again.', 'ตรวจสอบวันที่ เวลา และสถานที่ที่เลือก แล้วลองใหม่'),
            apiError: t('Couldn’t generate the trip. Check the connection and try again.', 'สร้างแผนเที่ยวไม่ได้ ตรวจสอบการเชื่อมต่อแล้วลองใหม่'),
          }[error]}</p>}
          <button type="submit" className="primary generate"><Route size={19} aria-hidden="true" />{loading ? t('Generating trip…', 'กำลังสร้างแผนเที่ยว…') : t('Generate trip', 'สร้างแผนเที่ยว')}</button>
          <p className="hint demo-note"><Info size={16} aria-hidden="true" />{t('Travel times and opening hours use Bangkok demo data.', 'เวลาเดินทางและเวลาเปิดใช้ข้อมูลจำลองสำหรับกรุงเทพฯ')}</p>
        </fieldset>
        <span className="sr-only" role="status">{loading && t('Generating trip…', 'กำลังสร้างแผนเที่ยว…')}</span>
      </form>
      <aside className="map-column"><TripMap places={selected} /></aside>
    </div>
  </main>
}
