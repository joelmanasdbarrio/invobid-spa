import ColorBadge from '@/components/color-badge'
import { Button } from '@/components/ui/button.tsx'
import useLocale from '@/hooks/use-locale'
import { formatDateTime } from '@/lib/format-date'
import { downloadDocument } from '@/services/document.api.ts'
import { DocumentType, type Document } from '@/types/Document.ts'
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
      accessorKey: 'type',
      header: 'Tipo de documento',
      cell: ({row}) => {
        switch (row.original.type) {
          case DocumentType.MODELO_111:
            return (
              <ColorBadge color='blue'>
                Modelo 111
              </ColorBadge>
            )
          case DocumentType.MODELO_303:
            return (
              <ColorBadge color='green'>
                Modelo 303
              </ColorBadge>
            )
          default:
            return row.original.type
        }
      }
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
