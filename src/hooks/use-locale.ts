import { LocaleContext } from '@/contexts/locale.context'
import { use } from 'react'

export function useLocale () {
  const context = use(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
