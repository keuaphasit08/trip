import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Planner from './pages/Planner'
import Result from './pages/Result'
import { LanguageContext } from './services/language'
import './styles.css'

function bangkokDate() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Bangkok' }).format(new Date())
}

function App() {
  const { pathname } = useLocation()
  const [language, setLanguage] = useState(() => {
    try { return localStorage.getItem('tripflow-language') === 'th' ? 'th' : 'en' } catch { return 'en' }
  })
  const [draft, setDraft] = useState(() => ({
    start: null, stops: [], date: bangkokDate(), startTime: '09:00', transport: 'car', mode: 'smart',
  }))
  const [result, setResult] = useState(null)

  useEffect(() => {
    document.documentElement.lang = language
    document.title = language === 'th' ? 'TripFlow — วางแผนเที่ยวอัจฉริยะ' : 'TripFlow — Smart Travel Planner'
    try { localStorage.setItem('tripflow-language', language) } catch { /* Storage is optional. */ }
  }, [language])

  useEffect(() => {
    window.scrollTo(0, 0)
    const heading = document.querySelector('main h1')
    if (heading) {
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }
  }, [pathname])

  return <LanguageContext.Provider value={language}>
    <Routes>
      <Route element={<Layout setLanguage={setLanguage} />}>
        <Route index element={<Home />} />
        <Route path="planner" element={<Planner draft={draft} setDraft={setDraft} setResult={setResult} />} />
        <Route path="trip" element={<Result result={result} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </LanguageContext.Provider>
}

createRoot(document.getElementById('root')).render(<StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>)
