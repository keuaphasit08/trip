import { CalendarClock, MapPin, Route, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../services/language'

const photo = 'https://upload.wikimedia.org/wikipedia/commons/6/63/Wat_Arun_from_Chao_Phraya_River_at_sunset.jpg'
const photoSource = 'https://commons.wikimedia.org/wiki/File:Wat_Arun_from_Chao_Phraya_River_at_sunset.jpg'

export default function Home() {
  const { t } = useLanguage()
  const features = [
    [MapPin, t('Save your stops', 'เลือกจุดหมาย'), t('Pick a starting point and add the Bangkok places you want to visit.', 'เลือกจุดเริ่มต้นและเพิ่มสถานที่ในกรุงเทพฯ ที่คุณอยากไป')],
    [Zap, t('Spend less time in transit', 'ลดเวลาเดินทาง'), t('Fastest mode looks for a shorter route by car, public transit, or on foot.', 'โหมดเร็วที่สุดช่วยหาเส้นทางที่ใช้เวลาเดินทางน้อยลง ไม่ว่าจะขับรถ ใช้ขนส่งสาธารณะ หรือเดิน')],
    [CalendarClock, t('Visit during opening hours', 'เที่ยวตามเวลาเปิด'), t('Smart mode works around opening hours and the time you want to spend at each stop.', 'โหมดอัจฉริยะจัดตารางตามเวลาเปิดและเวลาที่คุณอยากใช้ในแต่ละจุด')],
  ]
  return <main className="shell home">
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><MapPin size={16} aria-hidden="true" />{t('BANGKOK TRIP PLANNER', 'วางแผนเที่ยวกรุงเทพฯ')}</div>
        <h1>{t('Plan a better day', 'วางแผนเที่ยว')}{' '}<em>{t('in Bangkok.', 'กรุงเทพฯ')}</em></h1>
        <p>{t('Pick the places you want to see and turn them into an itinerary for your day out. TripFlow orders your stops and estimates when you’ll get to each one.', 'เลือกสถานที่ที่อยากไป แล้วจัดเป็นแผนเที่ยวกรุงเทพฯ สำหรับหนึ่งวัน TripFlow ช่วยเรียงจุดแวะและประมาณเวลาที่คุณจะไปถึงแต่ละจุด')}</p>
        <Link className="primary hero-cta" to="/planner"><Route size={20} aria-hidden="true" />{t('Start planning', 'เริ่มวางแผน')}</Link>
        <small>{t('Bangkok demo · Sample travel times and opening hours', 'ตัวอย่างสำหรับกรุงเทพฯ · ใช้เวลาเดินทางและเวลาเปิดจำลอง')}</small>
      </div>
      <figure className="hero-photo">
        <img src={photo} alt={t('Wat Arun across the Chao Phraya River at sunset', 'วัดอรุณริมแม่น้ำเจ้าพระยายามพระอาทิตย์ตก')} />
        <figcaption>
          <span className="photo-icon"><MapPin size={20} aria-hidden="true" /></span>
          <div><strong>{t('Wat Arun', 'วัดอรุณ')}</strong><span>{t('Chao Phraya River, Bangkok', 'แม่น้ำเจ้าพระยา กรุงเทพฯ')}</span></div>
          <a href={photoSource} className="photo-credit">{t('Photo credit', 'เครดิตภาพ')}</a>
        </figcaption>
      </figure>
    </section>
    <section className="features" aria-labelledby="features">
      <h2 id="features">{t('From places to a plan', 'จากจุดหมายสู่แผนเที่ยว')}</h2>
      <div className="feature-grid">
        {features.map(([Icon, title, description]) => <article className="feature" key={title}>
          <div className="icon-tile"><Icon size={22} aria-hidden="true" /></div>
          <h3>{title}</h3><p>{description}</p>
        </article>)}
      </div>
    </section>
  </main>
}
