import { useMemo, useState } from 'react'
import { LocaleContext } from './locale.context'

const LOCALE_STORAGE_KEY = 'locale'
const DEFAULT_LOCALE = 'es-ES'

export function LocaleProvider ({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<string>(() => {
    return localStorage.getItem(LOCALE_STORAGE_KEY) ?? DEFAULT_LOCALE
  })

  function setLocale (newLocale: string) {
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
    setLocaleState(newLocale)
  }

  const contextValue = useMemo(() => ({ locale, setLocale }), [locale])

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  )
}
