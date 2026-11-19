import { Globe2, MapPin, Route } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useLanguage } from '../../services/language'

export function Brand() {
  return <Link to="/" className="brand"><span><Route size={22} aria-hidden="true" /></span>TripFlow</Link>
}

export default function Layout({ setLanguage }) {
  const { t, lang } = useLanguage()
  return <>
    <header className="site-header">
      <div className="shell header-inner">
        <Brand />
        <nav aria-label={t('Main navigation', 'เมนูหลัก')}>
          <NavLink end to="/">{t('Home', 'หน้าหลัก')}</NavLink>
          <NavLink to="/planner">{t('Trip planner', 'วางแผนทริป')}</NavLink>
        </nav>
        <div className="language-control">
          <Globe2 size={16} aria-hidden="true" />
          <select aria-label={t('Language', 'ภาษา')} value={lang} onChange={e => setLanguage(e.target.value)}>
            <option value="en">English</option><option value="th">ไทย</option>
          </select>
        </div>
      </div>
    </header>
    <Outlet />
    <footer className="shell site-footer">
      <Brand />
      <span><MapPin size={15} aria-hidden="true" />{t('Bangkok, Thailand', 'กรุงเทพมหานคร ประเทศไทย')}</span>
    </footer>
  </>
}
