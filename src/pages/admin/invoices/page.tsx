import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import useLoggedInUser from '@/hooks/use-loggedInUser'
import { getInvoices } from '@/services/invoice.api'
import { InvoiceStatus, type Invoice } from '@/types/Invoice'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeftIcon, ChevronRightIcon, FileTextIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router'
import z from 'zod'
import { useInvoiceColumns } from './components/columns'
import { DataTable } from './components/data-table'
import InvoiceFilters from './components/filters'

const formSchema = z.object({
  sellerCompanyName: z.string().optional(),
  buyerCompanyName: z.string().optional(),
  debtorCompanyName: z.string().optional(),
  invoiceSvc: z.string().optional(),
  maxAmount: z.number().positive().optional(),
  minAmount: z.number().positive().optional(),
  minRating: z.number().positive().optional(),
  dueDateFrom: z.string().optional(),
  dueDateTo: z.string().optional(),
  status: z.enum(InvoiceStatus).optional(),
  isSold: z.boolean().optional(),
  includeDeleted: z.boolean().optional()
}).refine(data => {
  if (data.dueDateFrom && data.dueDateTo) {
    return new Date(data.dueDateFrom) <= new Date(data.dueDateTo)
  }
  return true
}, {
  message: 'La fecha de vencimiento "desde" debe ser anterior a la fecha de vencimiento "hasta", y el importe mínimo debe ser menor o igual al importe máximo.'
}).refine(data => {
  if (data.minAmount !== undefined && data.maxAmount !== undefined) {
    return data.minAmount < data.maxAmount
  }
  return true
}, {
  message: 'El importe máximo debe ser mayor que el importe mínimo.',
  path: ['maxAmount']
})

export default function AdminInvoicesPage () {
  const [searchParams, setSearchParams] = useSearchParams()

  const defaultForm = useMemo(() => ({
    invoiceSvc: searchParams.get('invoiceSvc') || undefined,
    sellerCompanyName: searchParams.get('sellerCompanyName') || undefined,
    buyerCompanyName: searchParams.get('buyerCompanyName') || undefined,
    debtorCompanyName: searchParams.get('debtorCompanyName') || undefined,
    maxAmount: searchParams.get('maxAmount') ? Number(searchParams.get('maxAmount')) : undefined,
    minAmount: searchParams.get('minAmount') ? Number(searchParams.get('minAmount')) : undefined,
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
    status: searchParams.get('status') as InvoiceStatus || undefined,
    dueDateFrom: searchParams.get('dueDateFrom') || undefined,
    dueDateTo: searchParams.get('dueDateTo') || undefined,
    isSold: searchParams.get('isSold') ? searchParams.get('isSold') === 'true' : undefined,
    includeDeleted: searchParams.get('includeDeleted') ? searchParams.get('includeDeleted') === 'true' : undefined
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
  const invoiceColumns = useInvoiceColumns()

  const [currentPage, setCurrentPage] = useState<number>(parseInt(searchParams.get('page') || '1', 10))
  const [currentLimit, setCurrentLimit] = useState<number>(parseInt(searchParams.get('limit') || '10', 10))

  function onSubmit (data: z.infer<typeof formSchema>) {
    const formData = Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) => value !== '' && value !== undefined
      )
    )
    const newParams = new URLSearchParams(formData as Record<string, string>)
    newParams.set('page', '1')
    newParams.set('limit', currentLimit.toString())
    setSearchParams(newParams)
  }

  const loggedInUser = useLoggedInUser()

  useEffect(() => {
    const filters: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      if (key !== 'page' && key !== 'limit') {
        if (value === 'true') {
          filters[key] = '1'
        } else if (value !== 'false') {
          filters[key] = value
        }
      }
    })

    getInvoices({
      ...filters,
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
      sellerCompanyName: undefined,
      buyerCompanyName: undefined,
      debtorCompanyName: undefined,
      maxAmount: undefined,
      minAmount: undefined,
      minRating: undefined,
      status: undefined,
      dueDateFrom: undefined,
      dueDateTo: undefined,
      isSold: undefined,
      includeDeleted: undefined
    })
    setSearchParams(new URLSearchParams({ page: '1', limit: '10' }))
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
        <h2>Consultar facturas</h2>
      </div>
      <Dialog>
        <div className='hidden md:block'>
          <InvoiceFilters form={form} onSubmit={onSubmit} handleClear={handleClear} />
        </div>

        <DialogContent className='max-h-svh overflow-scroll'>
          <DialogHeader className='font-bold text-lg'>
            Filtrar usuarios
          </DialogHeader>
          <InvoiceFilters form={form} onSubmit={onSubmit} handleClear={handleClear} />
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
          Página {currentPage} de {Math.ceil(totalItems / currentLimit)}
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
