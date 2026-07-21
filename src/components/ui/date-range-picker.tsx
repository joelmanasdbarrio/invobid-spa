import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useLocale } from '@/hooks/use-locale'
import { formatDate, parseLocalDate, toDateOnlyString } from '@/lib/format-date'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'
import { type DateRange } from 'react-day-picker'

interface DateRangePickerProps {
  fromDate?: string
  toDate?: string
  onFromChange: (dateStr: string | undefined) => void
  onToChange: (dateStr: string | undefined) => void
  minDate?: string
  maxDate?: string
}

export function DateRangePicker ({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
  minDate,
  maxDate
}: DateRangePickerProps) {
  const { locale } = useLocale()

  const range = React.useMemo<DateRange>(() => ({
    from: fromDate ? parseLocalDate(fromDate) : undefined,
    to: toDate ? parseLocalDate(toDate) : undefined
  }), [fromDate, toDate])

  const handleSelect = (day: Date | undefined, type: 'from' | 'to') => {
    if (type === 'from') {
      const newFrom = day
      onFromChange(newFrom ? toDateOnlyString(newFrom) : undefined)
    } else {
      const newTo = day
      onToChange(newTo ? toDateOnlyString(newTo) : undefined)
    }
  }

  const displayText = React.useMemo(() => {
    if (!range.from && !range.to) {
      return 'Selecciona un rango'
    }
    if (range.from && !range.to) {
      return formatDate(toDateOnlyString(range.from), locale)
    }
    if (range.from && range.to) {
      return `${formatDate(toDateOnlyString(range.from), locale)} - ${formatDate(toDateOnlyString(range.to), locale)}`
    }
    return 'Selecciona un rango'
  }, [range, locale])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-full justify-start text-left font-normal',
            !range.from && !range.to && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className='mr-2 size-4' />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='range'
          defaultMonth={range.from}
          selected={range}
          onSelect={(day: DateRange | undefined) => {
            if (day?.from) {
              handleSelect(day.from, 'from')
            }
            if (day?.to) {
              handleSelect(day.to, 'to')
            }
          }}
          numberOfMonths={2}
          disabled={[
            ...(minDate ? [{ before: new Date(minDate) }] : []),
            ...(maxDate ? [{ after: new Date(maxDate) }] : [])
          ]}
        />
        <Button
          variant='outline'
          className='w-full rounded-none'
          onClick={() => {
            onFromChange(undefined)
            onToChange(undefined)
          }}
        >
          Limpiar
        </Button>
      </PopoverContent>
    </Popover>
  )
}
