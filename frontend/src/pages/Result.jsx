import { CalendarDays, Clock3, Info, MapPin, Pencil, Route, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import Timeline from '../components/results/Timeline'
import TripMap from '../components/planner/TripMap'
import { useLanguage } from '../services/language'

export default function Result({ result }) {
  const { t, lang, placeName } = useLanguage()

  if (!result) return <main className="shell workspace-page">
    <section className="panel empty-result">
      <div className="icon-tile"><Route size={23} aria-hidden="true" /></div>
      <h1>{t('No itinerary yet', 'ยังไม่มีแผนเที่ยว')}</h1>
      <p>{t('Choose your stops and generate a trip to see it here.', 'เลือกจุดแวะแล้วสร้างแผนเที่ยวเพื่อดูผลที่นี่')}</p>
      <Link className="primary" to="/planner">{t('Open trip planner', 'เปิดตัววางแผนทริป')}</Link>
    </section>
  </main>

  const places = [
    { place: result.start_place, index: 0 },
    ...result.ordered_stops.map((stop, i) => ({ place: stop.place, index: i + 1 })),
  ]
  const date = new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-GB', {
    dateStyle: 'long', timeZone: 'Asia/Bangkok',
  }).format(new Date(result.start_datetime))
  const transport = {
    car: t('Car', 'รถยนต์'), transit: t('Public transit', 'ขนส่งสาธารณะ'), walk: t('Walking', 'เดิน'),
  }[result.transport]
  const metrics = [
    [MapPin, result.ordered_stops.length, t('Scheduled stops', 'จุดแวะในแผน')],
    [Route, result.total_travel_minutes, t('Travel minutes', 'นาทีเดินทาง')],
    [Clock3, result.total_trip_minutes, t('Total minutes', 'นาทีทั้งหมด')],
  ]
  return <main className="shell workspace-page">
    <div className="page-heading result-heading">
      <div>
        <div className="eyebrow"><CalendarDays size={16} aria-hidden="true" />{date}</div>
        <h1>{t('Your Bangkok itinerary', 'แผนเที่ยวกรุงเทพฯ ของคุณ')}</h1>
        <p>{transport} · {result.mode === 'smart' ? t('Smart schedule', 'ตารางอัจฉริยะ') : t('Fastest route', 'เส้นทางเร็วที่สุด')}</p>
      </div>
      <Link className="secondary" to="/planner"><Pencil size={17} aria-hidden="true" />{t('Edit & recalculate', 'แก้ไขและคำนวณใหม่')}</Link>
    </div>
    <section className="metrics" aria-label={t('Trip summary', 'สรุปทริป')}>{metrics.map(([Icon, value, label]) => <div className="metric" key={label}>
      <span className="icon-tile"><Icon size={20} aria-hidden="true" /></span><div><strong>{value}</strong><small>{label}</small></div>
    </div>)}</section>
    <div className="workspace-grid">
      <div className="result-details">
        {!!result.warnings.length && <section className="warnings">
          <h2><TriangleAlert size={19} aria-hidden="true" />{t('Skipped destinations', 'จุดหมายที่จัดลงแผนไม่ได้')}</h2>
          <ul>{result.warnings.map(({ code, place }) => <li key={place.id}><strong>{placeName(place)}</strong>{' · '}{code === 'closed'
            ? t('Closed on the selected date.', 'ปิดในวันที่เลือก')
            : t('No visit slot fit the requested duration and opening hours in this itinerary.', 'ไม่มีช่วงเวลาในแผนที่พอสำหรับการเที่ยวภายในเวลาเปิด')}</li>)}</ul>
        </section>}
        <Timeline result={result} />
        {result.data_source === 'mock' && <p className="hint demo-note"><Info size={16} aria-hidden="true" />{t('Estimates use sample travel times and opening hours. All times are local to Bangkok.', 'ประมาณการจากเวลาเดินทางและเวลาเปิดจำลอง ทุกเวลาเป็นเวลาท้องถิ่นกรุงเทพฯ')}</p>}
      </div>
      <aside className="map-column"><TripMap places={places} isRoute geometry={result.route_geometry} /></aside>
    </div>
  </main>
}
