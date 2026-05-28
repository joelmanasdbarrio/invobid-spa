import { Progress } from '@/components/ui/progress'
import { useLocale } from '@/hooks/use-locale'
import { formatCountdown, formatDateTime } from '@/lib/format-date'
import { cn } from '@/lib/utils'
import { CrownIcon, MoveRightIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ProgressBar ({ dateStart, dateEnd }: { dateStart: string; dateEnd: string }) {
  const { locale } = useLocale()

  const start = new Date(dateStart).getTime()
  const end = new Date(dateEnd).getTime()

  const [tick, setTick] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const now = tick

  const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100))
  const label = formatCountdown(end - now)

  return (
    <div className='flex flex-col gap-1 w-full'>
      <div className='flex items-center justify-between text-center text-xs text-muted-foreground'>
        <span title={`Fecha de inicio ${formatDateTime(dateStart, locale)}`}>{formatDateTime(dateStart, locale)}</span>
        <MoveRightIcon className='w-2 h-2' />
        {(end - now) < 0
          ? (
            <span title='Subasta finalizada' className='flex items-center gap-1'>
              <CrownIcon className='size-4 inline-block' />
              Finalizada
            </span>
          )
          : (
            <div className='relative'>
              <span title={`Tiempo restante ${label}`} className='flex items-center gap-1'>
                {label} restantes
              </span>
              {(end - now) < 60000 && (end - now) > 0 && (
                <span title={`Tiempo restante ${label}`} className='flex items-center gap-1 animate-ping absolute top-0'>
                  {label} restantes
                </span>
              )}
            </div>
          )}

        <MoveRightIcon className='w-2 h-2' />
        <span title={`Fecha de fin ${formatDateTime(dateEnd, locale)}`}>{formatDateTime(dateEnd, locale)}</span>
      </div>
      <Progress value={progress} className={cn()} />
    </div>
  )
}
