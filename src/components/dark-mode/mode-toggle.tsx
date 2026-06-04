import { Toggle } from '@/components/ui/toggle.tsx'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from './theme-provider'

export function ThemeToggle () {
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
      className='relative h-auto px-2 py-1.5 font-normal w-full justify-start data-[state=on]:bg-popover hover:data-[state=on]:bg-accent hover:bg-accent hover:text-accent-foreground hover:cursor-pointer'
    >
      <SunIcon
        className='size-[1.2rem] rotate-0 scale-100 transition-all absolute top-1/2 left-4 -translate-x-1/2 -translate-y-1/2 dark:scale-0 dark:-rotate-90 text-muted-foreground'
        aria-hidden='true'
      />
      <MoonIcon
        className='size-[1.2rem] rotate-90 scale-0 transition-all absolute top-1/2 left-4 -translate-x-1/2 -translate-y-1/2 dark:rotate-0 dark:scale-100 text-muted-foreground'
        aria-hidden='true'
      />
      <span className='ms-6'>Toggle theme</span>
    </Toggle>
  )
}
