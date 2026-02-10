import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'
import { type DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
  fromDate?: string
  toDate?: string
  onFromChange: (dateStr: string | undefined) => void
  onToChange: (dateStr: string | undefined) => void
}

export function DateRangePicker ({
  fromDate,
  toDate,
  onFromChange,
  onToChange
}: DateRangePickerProps) {
  const [range, setRange] = React.useState<{ from?: Date; to?: Date }>({
    from: fromDate ? new Date(fromDate) : undefined,
    to: toDate ? new Date(toDate) : undefined
  })

  React.useEffect(() => {
    setRange({
      from: fromDate ? new Date(fromDate) : undefined,
      to: toDate ? new Date(toDate) : undefined
    })
  }, [fromDate, toDate])

  const handleSelect = (day: Date | undefined, type: 'from' | 'to') => {
    if (type === 'from') {
      const newFrom = day
      setRange(prev => ({ ...prev, from: newFrom }))
      onFromChange(newFrom ? format(newFrom, 'yyyy-MM-dd') : undefined)
    } else {
      const newTo = day
      setRange(prev => ({ ...prev, to: newTo }))
      onToChange(newTo ? format(newTo, 'yyyy-MM-dd') : undefined)
    }
  }

  const displayText = React.useMemo(() => {
    if (!range.from && !range.to) {
      return 'Selecciona un rango'
    }
    if (range.from && !range.to) {
      return format(range.from, 'dd/MM/yyyy')
    }
    if (range.from && range.to) {
      return `${format(range.from, 'dd/MM/yyyy')} - ${format(range.to, 'dd/MM/yyyy')}`
    }
    return 'Selecciona un rango'
  }, [range])

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
          <CalendarIcon className='mr-2 h-4 w-4' />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          initialFocus
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
        />
        <Button
          variant='outline'
          className='w-full'
          onClick={() => {
            setRange({ from: undefined, to: undefined })
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
