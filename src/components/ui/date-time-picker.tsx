import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import useLocale from '@/hooks/use-locale'
import { formatDateTime, parseDateTime, toTimeString } from '@/lib/format-date'
import { cn } from '@/lib/utils'
import { CalendarIcon, ClockIcon } from 'lucide-react'
import * as React from 'react'

interface DateTimePickerProps {
  id?: string
  value?: string
  onChange?: (isoStr: string | undefined) => void
  disabled?: boolean
  placeholder?: string
  minDate?: string
  maxDate?: string
}

export function DateTimePicker ({
  id,
  value,
  onChange,
  disabled = false,
  placeholder = 'Selecciona fecha y hora',
  minDate,
  maxDate
}: DateTimePickerProps) {
  const { locale } = useLocale()

  const [date, setDate] = React.useState<Date | undefined>(
    value ? parseDateTime(value) : undefined
  )

  React.useEffect(() => {
    setDate(value ? parseDateTime(value) : undefined)
  }, [value])

  /** When the user picks a calendar day, keep the existing time (or default to 00:00). */
  const handleDaySelect = (day: Date | undefined) => {
    if (!day) {
      setDate(undefined)
      onChange?.(undefined)
      return
    }
    const next = new Date(day)
    if (date) {
      next.setHours(date.getHours(), date.getMinutes(), 0, 0)
    } else {
      next.setHours(0, 0, 0, 0)
    }
    setDate(next)
    onChange?.(next.toISOString())
  }

  /** When the user changes the time input, keep the existing date. */
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number)
    const next = date ? new Date(date) : new Date()
    next.setHours(hours, minutes, 0, 0)
    setDate(next)
    onChange?.(next.toISOString())
  }

  const displayText = React.useMemo(() => {
    if (!date) return placeholder
    return formatDateTime(date, locale)
  }, [date, placeholder, locale])

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <button
            id={id}
            disabled={disabled}
            type='button'
            className={cn(
              'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 border bg-transparent px-3 py-1 text-base outline-none md:text-sm',
              'disabled:pointer-events-none disabled:cursor-not-allowed',
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
              'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
              'flex items-center rounded-lg',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon
              className={cn(
                'mr-2 h-4 w-4 text-muted-foreground',
                disabled && 'cursor-not-allowed opacity-80'
              )}
            />
            <span className={cn(disabled && 'cursor-not-allowed opacity-50')}>
              {displayText}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            defaultMonth={date}
            selected={date}
            onSelect={handleDaySelect}
            disabled={[
              ...(minDate ? [{ before: new Date(minDate) }] : []),
              ...(maxDate ? [{ after: new Date(maxDate) }] : [])
            ]}
          />
          <div className='border-t p-3 flex items-center gap-2'>
            <ClockIcon className='h-4 w-4 text-muted-foreground shrink-0' />
            <input
              type='time'
              value={date ? toTimeString(date) : ''}
              onChange={handleTimeChange}
              className='flex-1 bg-transparent text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded px-1'
            />
          </div>
          <Button
            variant='outline'
            className='w-full rounded-none'
            onClick={() => {
              setDate(undefined)
              onChange?.(undefined)
            }}
          >
            Limpiar
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  )
}
