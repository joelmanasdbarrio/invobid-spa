import { createContext } from 'react'

export type LocaleContextType = {
  dateLocale: string
  setDateLocale: (locale: string) => void
}

export const LocaleContext = createContext<LocaleContextType | undefined>(undefined)
