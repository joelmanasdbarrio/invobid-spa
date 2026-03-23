import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useLocale } from '@/hooks/use-locale'
import { formatDateTime, parseDateTime, toTimeString } from '@/lib/format-date'
import { cn } from '@/lib/utils'
import { CalendarIcon, ClockIcon } from 'lucide-react'
import * as React from 'react'
import type { DateRange } from 'react-day-picker'

interface DateTimeRangePickerProps {
  fromValue?: string
  toValue?: string
  onFromChange?: (isoStr: string | undefined) => void
  onToChange?: (isoStr: string | undefined) => void
  disabled?: boolean
  minDate?: string
  maxDate?: string
  placeholder?: string
}

export function DateTimeRangePicker ({
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  disabled = false,
  minDate,
  maxDate,
  placeholder = 'Selecciona rango de fechas y hora'
}: DateTimeRangePickerProps) {
  const { locale } = useLocale()

  const [from, setFrom] = React.useState<Date | undefined>(
    fromValue ? parseDateTime(fromValue) : undefined
  )
  const [to, setTo] = React.useState<Date | undefined>(
    toValue ? parseDateTime(toValue) : undefined
  )

  React.useEffect(() => {
    setFrom(fromValue ? parseDateTime(fromValue) : undefined)
  }, [fromValue])

  React.useEffect(() => {
    setTo(toValue ? parseDateTime(toValue) : undefined)
  }, [toValue])

  const handleRangeSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      const next = new Date(range.from)
      next.setHours(from?.getHours() ?? 0, from?.getMinutes() ?? 0, 0, 0)
      setFrom(next)
      onFromChange?.(next.toISOString())
    }
    if (range?.to) {
      const next = new Date(range.to)
      next.setHours(to?.getHours() ?? 0, to?.getMinutes() ?? 0, 0, 0)
      setTo(next)
      onToChange?.(next.toISOString())
    }
  }

  const handleFromTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number)
    const next = from ? new Date(from) : new Date()
    next.setHours(hours, minutes, 0, 0)
    setFrom(next)
    onFromChange?.(next.toISOString())
  }

  const handleToTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number)
    const next = to ? new Date(to) : new Date()
    next.setHours(hours, minutes, 0, 0)
    setTo(next)
    onToChange?.(next.toISOString())
  }

  const displayText = React.useMemo(() => {
    if (!from && !to) return placeholder
    if (from && !to) return formatDateTime(from, locale)
    if (from && to) return `${formatDateTime(from, locale)} – ${formatDateTime(to, locale)}`
    return placeholder
  }, [from, to, placeholder, locale])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          type='button'
          className={cn(
            'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 border bg-transparent px-3 py-1 text-base outline-none md:text-sm',
            'disabled:pointer-events-none disabled:cursor-not-allowed',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            'flex items-center rounded-lg',
            !from && !to && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className={cn('mr-2 h-4 w-4 text-muted-foreground shrink-0', disabled && 'cursor-not-allowed opacity-80')} />
          <span className={cn('truncate', disabled && 'cursor-not-allowed opacity-50')}>
            {displayText}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='range'
          defaultMonth={from}
          selected={{ from, to }}
          onSelect={handleRangeSelect}
          numberOfMonths={2}
          disabled={[
            ...(minDate ? [{ before: new Date(minDate) }] : []),
            ...(maxDate ? [{ after: new Date(maxDate) }] : [])
          ]}
        />
        <div className='border-t p-3 grid grid-cols-2 gap-4'>
          <div className='flex items-center gap-2'>
            <ClockIcon className='h-4 w-4 text-muted-foreground shrink-0' />
            <span className='text-xs text-muted-foreground'>Inicio</span>
            <input
              type='time'
              value={from ? toTimeString(from) : ''}
              onChange={handleFromTimeChange}
              className='flex-1 bg-transparent text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded px-1'
            />
          </div>
          <div className='flex items-center gap-2'>
            <ClockIcon className='h-4 w-4 text-muted-foreground shrink-0' />
            <span className='text-xs text-muted-foreground'>Fin</span>
            <input
              type='time'
              value={to ? toTimeString(to) : ''}
              onChange={handleToTimeChange}
              className='flex-1 bg-transparent text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded px-1'
            />
          </div>
        </div>
        <Button
          variant='outline'
          className='w-full rounded-none'
          onClick={() => {
            setFrom(undefined)
            setTo(undefined)
            onFromChange?.(undefined)
            onToChange?.(undefined)
          }}
        >
          Limpiar
        </Button>
      </PopoverContent>
    </Popover>
  )
}
