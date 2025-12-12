import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'
import { Toggle } from '@/components/ui/toggle.tsx'

export function ModeToggle () {
  const { theme, setTheme } = useTheme()

  const isDark = theme === 'dark'

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <Toggle
      aria-label='Toggle theme'
      pressed={isDark}
      onPressedChange={handleToggle}
      variant='outline'
      className='relative'
    >
      <Sun
        className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 dark:scale-0 dark:-rotate-90'
        aria-hidden='true'
      />
      <Moon
        className='h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 dark:rotate-0 dark:scale-100'
        aria-hidden='true'
      />
      <span className='sr-only'>Toggle theme</span>
    </Toggle>
  )
}
