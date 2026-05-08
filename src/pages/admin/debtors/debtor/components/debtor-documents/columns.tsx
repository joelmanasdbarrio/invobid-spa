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
              <DownloadIcon className='w-4 h-4' />
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
    // {
    //   accessorKey: 'type',
    //   header: 'Tipo de documento',
    //   cell: ({row}) => {
    //     switch (row.original.type) {
    //       case DocumentType.TAX_111_QUARTERLY:
    //         return (
    //           <ColorBadge color='blue'>
    //             Modelo 111 trimestral
    //           </ColorBadge>
    //         )
    //       case DocumentType.TAX_111_ANNUAL:
    //         return (
    //           <ColorBadge color='green'>
    //             Modelo 111 anual
    //           </ColorBadge>
    //         )
    //       case DocumentType.TAX_303_QUARTERLY:
    //         return (
    //           <ColorBadge color='blue'>
    //             Modelo 303 trimestral
    //           </ColorBadge>
    //         )
    //       case DocumentType.TAX_303_ANNUAL:
    //         return (
    //           <ColorBadge color='green'>
    //             Modelo 303 anual
    //           </ColorBadge>
    //         )
    //       default:
    //         return row.original.type
    //     }
    //   }
    // },
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
