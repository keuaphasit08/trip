import { createContext, useContext } from 'react'

export const LanguageContext = createContext('en')
export function useLanguage() {
  const lang = useContext(LanguageContext)
  return {
    lang,
    t: (en, th) => lang === 'th' ? th : en,
    placeName: place => lang === 'th' ? place.name_th : place.name,
    districtName: place => lang === 'th' ? place.district_th : place.district,
  }
}
