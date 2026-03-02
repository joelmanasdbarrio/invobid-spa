import { Button } from '@/components/ui/button.tsx'
import useLocale from '@/hooks/use-locale'
import { formatDateTime } from '@/lib/format-date'
import { downloadDocument } from '@/services/document.api.ts'
import { type Document } from '@/types/Document.ts'
import type { ColumnDef } from '@tanstack/react-table'
import { DownloadIcon } from 'lucide-react'
import { useMemo } from 'react'

export function useDocumentColumns (): ColumnDef<Document>[] {
  const { locale } = useLocale()

  return useMemo(() => [
    {
      accessorKey: 'id',
      header: '',
      cell: ({row}) => {
        const extension = row.original.filename.split('.').pop()
        const filename = `${row.original.title}.${extension}`
        return (
          <Button variant='ghost' onClick={() => downloadDocument(row.original.id, filename)}>
            <DownloadIcon className='w-4 h-4' />
          </Button>
        )
      },
      size: 10
    },
    {
      accessorKey: 'title',
      header: 'Título'
    },
    {
      accessorKey: 'value',
      header: 'Valor'
    },
    {
      accessorKey: 'createdAt',
      header: 'Fecha de subida',
      cell: ({row}) => formatDateTime(row.original.createdAt, locale)
    }
  ], [locale])
}
