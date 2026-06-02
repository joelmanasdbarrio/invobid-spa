import { Button } from '@/components/ui/button.tsx'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select.tsx'
import { getInvoices } from '@/services/invoice.api'
import type { Invoice } from '@/types/Invoice'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useInvoiceColumns } from './columns'
import { DataTable } from './data-table'

export function AuctionInvoices ({ invoiceSvc } : { invoiceSvc: string | undefined }) {
  const invoiceColumns = useInvoiceColumns()
  const [data, setData] = useState<Invoice[]>([])
  const [totalItems, setTotalItems] = useState<number>(0)

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [currentLimit, setCurrentLimit] = useState<number>(10)

  useEffect(() => {
    if (invoiceSvc) {
      getInvoices({
        invoiceSvc,
        page: String(currentPage),
        limit: String(currentLimit)
      }).then(res => {
        setData(res.data)
        setTotalItems(res._metadata.total)
      })
    }
  }, [invoiceSvc, currentLimit, currentPage])

  return (
    <div className='flex flex-col gap-4'>
      <DataTable columns={invoiceColumns} data={data} totalItems={totalItems} />

      <div className='flex items-center justify-between gap-2 text-accent-foreground'>
        <div className='flex items-center justify-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentPage(prev => prev + 1)}
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
