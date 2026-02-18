import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'

interface DatePickerProps {
  id?: string
  value?: string
  onChange?: (dateStr: string | undefined) => void
  disabled?: boolean
  placeholder?: string
}

export function DatePicker ({
  id,
  value,
  onChange,
  disabled = false,
  placeholder = 'Selecciona una fecha'
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )

  React.useEffect(() => {
    setDate(value ? new Date(value) : undefined)
  }, [value])

  const handleSelect = (day: Date | undefined) => {
    setDate(day)
    onChange?.(day ? format(day, 'yyyy-MM-dd') : undefined)
  }

  const displayText = React.useMemo(() => {
    if (!date) {
      return placeholder
    }
    return format(date, 'dd/MM/yyyy')
  }, [date, placeholder])

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
              'flex items-center',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon
              className={
                cn(
                  'mr-2 h-4 w-4 text-muted-foreground',
                  disabled && 'cursor-not-allowed opacity-80'
                )
              }
            />
            <span
              className={
                cn(
                  disabled && 'cursor-not-allowed opacity-50'
                )
              }
            >{displayText}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            defaultMonth={date}
            selected={date}
            onSelect={handleSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
