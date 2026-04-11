import { Button } from '@/components/ui/button.tsx'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select.tsx'
import { DataTable } from '@/pages/admin/users/user/components/user-documents/data-table'
import { getDocuments } from '@/services/document.api.ts'
import { DocumentType } from '@/types/Document.ts'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDocumentColumns } from './columns'

export default function UserDocuments ({ investorId } : { investorId: string | undefined }) {
  const documentColumns = useDocumentColumns()
  const [data, setData] = useState([])
  const [totalItems, setTotalItems] = useState(0)

  const [currentPage, setCurrentPage] = useState(1)
  const [currentLimit, setCurrentLimit] = useState(10)

  useEffect(() => {
    if (investorId) {
      getDocuments({
        investorId,
        type: DocumentType.ID,
        page: String(currentPage),
        limit: String(currentLimit)
      }).then(res => {
        setData(res.data)
        setTotalItems(res['_metadata'].total)
      })
    }
  }, [investorId, currentLimit, currentPage])

  return (
    <div className='flex flex-col gap-4'>
      <DataTable columns={documentColumns} data={data} totalItems={totalItems} />

      <div className='flex items-center justify-between gap-2 text-accent-foreground'>
        <div className='flex items-center justify-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage * currentLimit >= totalItems}
          >
            <ChevronRightIcon />
          </Button>
          Página {currentPage} de {Math.ceil(totalItems / currentLimit)}
        </div>
        <div className='flex items-center gap-2'>
          <Select value={String(currentLimit)} onValueChange={value => setCurrentLimit(Number(value))}>
            <span className='text-sm'>Filas por página</span>
            <SelectTrigger>
              {currentLimit}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='5'>5</SelectItem>
              <SelectItem value='10'>10</SelectItem>
              <SelectItem value='20'>20</SelectItem>
              <SelectItem value='50'>50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
