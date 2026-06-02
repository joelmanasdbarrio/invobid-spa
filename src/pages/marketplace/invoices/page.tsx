import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import useLoggedInUser from '@/hooks/use-loggedInUser'
import { getInvoices } from '@/services/invoice.api'
import type { Invoice } from '@/types/Invoice'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeftIcon, ChevronRightIcon, FileTextIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router'
import z from 'zod'
import { useMarketplaceInvoiceColumns } from './components/columns'
import { DataTable } from './components/data-table'
import MarketplaceInvoiceFilters from './components/filters'

const formSchema = z.object({
  invoiceSvc: z.string().optional(),
  debtorCompanyName: z.string().optional(),
  sellerCompanyName: z.string().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  dueDateFrom: z.string().optional(),
  dueDateTo: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  minDiscount: z.number().min(0).max(100).optional(),
  minProfitability: z.number().min(0).optional()
}).refine(data => {
  if (data.dueDateFrom && data.dueDateTo) {
    return new Date(data.dueDateFrom) <= new Date(data.dueDateTo)
  }
  return true
}, {
  message: 'La fecha "desde" debe ser anterior a la fecha "hasta".',
  path: ['dueDateTo']
}).refine(data => {
  if (data.minAmount !== undefined && data.maxAmount !== undefined) {
    return data.minAmount < data.maxAmount
  }
  return true
}, {
  message: 'El importe máximo debe ser mayor que el importe mínimo.',
  path: ['maxAmount']
})

export default function MarketplaceInvoicesPage () {
  const invoiceColumns = useMarketplaceInvoiceColumns()
  const [searchParams, setSearchParams] = useSearchParams()

  const defaultForm = useMemo(() => ({
    invoiceSvc: searchParams.get('invoiceSvc') || undefined,
    debtorCompanyName: searchParams.get('debtorCompanyName') || undefined,
    sellerCompanyName: searchParams.get('sellerCompanyName') || undefined,
    minAmount: searchParams.get('minAmount') ? Number(searchParams.get('minAmount')) : undefined,
    maxAmount: searchParams.get('maxAmount') ? Number(searchParams.get('maxAmount')) : undefined,
    dueDateFrom: searchParams.get('dueDateFrom') || undefined,
    dueDateTo: searchParams.get('dueDateTo') || undefined,
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
    minDiscount: searchParams.get('minDiscount') ? Number(searchParams.get('minDiscount')) : undefined,
    minProfitability: searchParams.get('minProfitability') ? Number(searchParams.get('minProfitability')) : undefined
  }), [searchParams])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: defaultForm
  })

  useEffect(() => {
    form.reset(defaultForm)
  }, [form, defaultForm])

  const [data, setData] = useState<Invoice[]>([])
  const [totalItems, setTotalItems] = useState<number>(0)

  const [currentPage, setCurrentPage] = useState<number>(parseInt(searchParams.get('page') || '1', 10))
  const [currentLimit, setCurrentLimit] = useState<number>(parseInt(searchParams.get('limit') || '10', 10))

  function onSubmit (data: z.infer<typeof formSchema>) {
    const formData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== '' && value !== undefined)
    )
    const newParams = new URLSearchParams(formData as Record<string, string>)
    newParams.set('page', '1')
    newParams.set('limit', currentLimit.toString())
    setSearchParams(newParams)
  }

  const loggedInUser = useLoggedInUser()

  useEffect(() => {
    if (!loggedInUser) return

    const filters: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      if (key !== 'page' && key !== 'limit') {
        filters[key] = value
      }
    })

    getInvoices({
      ...filters,
      buyerInvestorId: loggedInUser.id,
      page: String(currentPage),
      limit: String(currentLimit)
    }).then(res => {
      setData(res.data)
      setTotalItems(res._metadata.total)
    })
  }, [loggedInUser, searchParams, currentPage, currentLimit])

  function handleClear () {
    form.reset({
      invoiceSvc: undefined,
      debtorCompanyName: undefined,
      sellerCompanyName: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      dueDateFrom: undefined,
      dueDateTo: undefined,
      minRating: undefined,
      minDiscount: undefined,
      minProfitability: undefined
    })
    setSearchParams(new URLSearchParams({ page: '1', limit: currentLimit.toString() }))
  }

  function handlePageChange (newPage: number) {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', newPage.toString())
    setCurrentPage(newPage)
    setSearchParams(newParams)
  }

  function handleLimitChange (newLimit: number) {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('limit', newLimit.toString())
    newParams.set('page', '1')
    setCurrentLimit(newLimit)
    setCurrentPage(1)
    setSearchParams(newParams)
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <span className='rounded-lg p-1 bg-primary/20 text-primary'>
          <FileTextIcon className='size-6' />
        </span>
        <h2>Facturas adquiridas</h2>
      </div>
      <Dialog>
        <div className='hidden md:block'>
          <MarketplaceInvoiceFilters form={form} onSubmit={onSubmit} handleClear={handleClear} />
        </div>

        <DialogContent className='max-h-svh overflow-scroll'>
          <DialogHeader className='font-bold text-lg'>
            Filtrar facturas
          </DialogHeader>
          <MarketplaceInvoiceFilters form={form} onSubmit={onSubmit} handleClear={handleClear} />
        </DialogContent>

        <DataTable columns={invoiceColumns} data={data} totalItems={totalItems} />
      </Dialog>

      <div className='flex items-center justify-between gap-2 text-accent-foreground'>
        <div className='flex items-center justify-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage * currentLimit >= totalItems}
          >
            <ChevronRightIcon />
          </Button>
          Página {currentPage} de {Math.ceil(totalItems / currentLimit) || 1}
        </div>
        <div className='flex items-center gap-2'>
          <Select value={String(currentLimit)} onValueChange={value => handleLimitChange(Number(value))}>
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
