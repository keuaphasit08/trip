import { Flag, MoveDown } from 'lucide-react'
import { useLanguage } from '../../services/language'

export default function Timeline({ result }) {
  const { t, lang, placeName, districtName } = useLanguage()
  const locale = lang === 'th' ? 'th-TH' : 'en-GB'
  const clock = new Intl.DateTimeFormat(locale, {
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Bangkok',
  })
  const day = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'Asia/Bangkok' })
  const time = value => value.slice(0, 10) === result.start_datetime.slice(0, 10)
    ? clock.format(new Date(value))
    : `${day.format(new Date(value))}, ${clock.format(new Date(value))}`

  return <section className="panel timeline-panel">
    <h2>{t('Itinerary', 'แผนเที่ยว')}</h2>
    <ol className="timeline">
      <li className="timeline-start">
        <span className="stop-number"><Flag size={16} aria-hidden="true" /></span>
        <div><small>{t('Starting point', 'จุดเริ่มต้น')}</small><h3>{placeName(result.start_place)}</h3></div>
        <time dateTime={result.start_datetime}>{time(result.start_datetime)}</time>
      </li>
      {result.ordered_stops.map((stop, index) => <li key={stop.place.id}>
        <p className="travel-leg"><MoveDown size={14} aria-hidden="true" />{t(`${stop.travel_minutes} min travel`, `เดินทาง ${stop.travel_minutes} นาที`)}</p>
        <div className="timeline-stop">
          <span className="stop-number" aria-hidden="true">{index + 1}</span>
          <div className="timeline-content">
            <small>{districtName(stop.place)}</small><h3>{placeName(stop.place)}</h3>
            <div className="stop-times">
              <span>{t('Arrive', 'ถึง')} <time dateTime={stop.arrival_time}>{time(stop.arrival_time)}</time></span>
              <span>{t('Depart', 'ออก')} <time dateTime={stop.departure_time}>{time(stop.departure_time)}</time></span>
            </div>
            {stop.wait_minutes > 0 && <p className="hint">{t(
              `Wait ${stop.wait_minutes} min · Visit starts at ${time(stop.visit_start_time)}`,
              `รอ ${stop.wait_minutes} นาที · เริ่มเที่ยว ${time(stop.visit_start_time)} น.`,
            )}</p>}
          </div>
        </div>
      </li>)}
    </ol>
    {!result.ordered_stops.length && <p className="hint">{t('No visits could be scheduled. Edit your trip to try a different start time or visit duration.', 'จัดจุดแวะไม่ได้ ลองแก้ไขเวลาเริ่มหรือระยะเวลาเที่ยว')}</p>}
  </section>
}
