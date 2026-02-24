import { useState } from 'react'
import { LocaleContext } from './locale.context'

const LOCALE_STORAGE_KEY = 'date-locale'
const DEFAULT_LOCALE = 'es-ES'

export function LocaleProvider ({ children }: { children: React.ReactNode }) {
  const [dateLocale, setDateLocaleState] = useState<string>(() => {
    return localStorage.getItem(LOCALE_STORAGE_KEY) ?? DEFAULT_LOCALE
  })

  function setDateLocale (locale: string) {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    setDateLocaleState(locale)
  }

  return (
    <LocaleContext.Provider value={{ dateLocale, setDateLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}
