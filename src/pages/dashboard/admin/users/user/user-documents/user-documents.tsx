import { Button } from '@/components/ui/button.tsx'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select.tsx'
import { documentColumns } from '@/pages/dashboard/admin/users/user/user-documents/columns.tsx'
import { DataTable } from '@/pages/dashboard/admin/users/user/user-documents/data-table.tsx'
import { getDocuments } from '@/services/document.api.ts'
import { DocumentType } from '@/types/Document.ts'
import { useEffect, useState } from 'react'

export default function UserDocuments ({ investorId } : { investorId: string | undefined }) {
  const [data, setData] = useState([])
  const [totalItems, setTotalItems] = useState(0)

  const [currentPage, setCurrentPage] = useState(1)
  const [currentLimit, setCurrentLimit] = useState(10)

  useEffect(() => {
    if (investorId) {
      getDocuments({
        investorId,
        type: DocumentType.IDENTIFICATION,
        page: currentPage,
        limit: currentLimit
      }).then(res => {
        setData(res.data)
        setTotalItems(res['_metadata'].total)
      })
    }
  }, [investorId, currentLimit, currentPage])

  return (
    <div className='flex flex-col gap-4'>
      <DataTable columns={documentColumns} data={data} />

      <div className='flex items-center justify-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        Página {currentPage} de {Math.ceil(totalItems / currentLimit)}
        <Button
          variant='outline'
          size='sm'
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage * currentLimit >= totalItems}
        >
          Siguiente
        </Button>
        <Select value={String(currentLimit)} onValueChange={value => setCurrentLimit(Number(value))}>
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
  )
}
