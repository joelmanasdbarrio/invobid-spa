import { DocumentPreview } from '@/components/document-preview'
import { Button } from '@/components/ui/button.tsx'
import { useLocale } from '@/hooks/use-locale'
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
          <div className='flex items-center gap-1'>
            <DocumentPreview document={row.original} triggerOnly protectedDocument />
            <Button variant='ghost' onClick={() => downloadDocument(row.original.id, filename)}>
              <DownloadIcon className='size-4' />
            </Button>
          </div>
        )
      },
      size: 20
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
