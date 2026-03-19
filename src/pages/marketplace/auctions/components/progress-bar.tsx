import { Progress } from '@/components/ui/progress'
import useLocale from '@/hooks/use-locale'
import { formatDateTime } from '@/lib/format-date'
import { cn } from '@/lib/utils'
import { CirclePauseIcon, MoveRightIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ProgressBar ({ dateStart, dateEnd, pausedAt }: { dateStart: string; dateEnd: string; pausedAt?: string | null }) {
  const { locale } = useLocale()

  const start = new Date(dateStart).getTime()
  const end = new Date(dateEnd).getTime()

  const [tick, setTick] = useState(() => Date.now())

  useEffect(() => {
    if (pausedAt) return
    const id = setInterval(() => setTick(Date.now()), 1000)
    return () => clearInterval(id)
  }, [pausedAt])

  const now = pausedAt ? new Date(pausedAt).getTime() : tick

  const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100))
  const remaining = Math.max(0, end - now)
  const days = Math.floor(remaining / 86_400_000)
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000)
  const minutes = Math.floor((remaining % 3_600_000) / 60_000)
  const seconds = Math.floor((remaining % 60_000) / 1_000)
  const label = days > 0 ? `${days}d ${hours}h ${minutes}m ${seconds}s` : hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : `${minutes}m ${seconds}s`

  return (
    <div className='flex flex-col gap-1 w-full'>
      <div className='flex items-center justify-between text-xs text-muted-foreground'>
        <span title={`Fecha de inicio ${formatDateTime(dateStart, locale)}`}>{formatDateTime(dateStart, locale)}</span>
        <MoveRightIcon className='w-2 h-2' />
        <span title={`Tiempo restante ${label}`} className='flex items-center gap-1'>
          {pausedAt && (
            <><CirclePauseIcon className='size-4 inline-block' /> Pausada - </>
          )}
          {label} restantes
        </span>
        <MoveRightIcon className='w-2 h-2' />
        <span title={`Fecha de fin ${formatDateTime(dateEnd, locale)}`}>{formatDateTime(dateEnd, locale)}</span>
      </div>
      <Progress value={progress} className={cn(pausedAt && '*:data-[slot="progress-indicator"]:bg-gray-500')} />
    </div>
  )
}
