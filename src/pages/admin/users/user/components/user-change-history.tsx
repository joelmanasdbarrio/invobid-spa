import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx'
import { FieldSeparator } from '@/components/ui/field.tsx'
import type { Investor } from '@/types/User'
import { HistoryIcon } from 'lucide-react'

export function UserChangeHistory ({ investor }: {investor: Investor | undefined}) {
  const createdAt = investor
    ? investor.createdAt
      ? new Date(investor.createdAt).toLocaleString('es-ES')
      : 'N/A'
    : 'N/A'
  const dateCreatedAt = createdAt.split(', ')[0]
  const timeCreatedAt = createdAt.split(', ')[1]

  const getDateLabel = () => {
    if (createdAt === 'N/A') return 'N/A'

    const createdDate = new Date(investor!.createdAt)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const createdDateOnly = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate())
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())

    if (createdDateOnly.getTime() === todayOnly.getTime()) return 'HOY'
    if (createdDateOnly.getTime() === yesterdayOnly.getTime()) return 'AYER'
    return dateCreatedAt
  }

  return (
    <Card >
      <CardHeader className='flex items-center gap-2'>
        <span className='rounded-md p-1 bg-primary/20 text-primary'>
          <HistoryIcon className='size-4' />
        </span>
        <h4>Historial de cambios</h4>
      </CardHeader>
      <CardContent>
        <ul className='list-disc list-inside space-y-2'>
          <li>Más cambios…</li>
          <FieldSeparator className='my-1'>
            {getDateLabel()}
          </FieldSeparator>
          <li>
            {timeCreatedAt}: Usuario creado
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}
