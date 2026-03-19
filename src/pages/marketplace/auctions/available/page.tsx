import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { getAuctions } from '@/services/auction.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeftIcon, ChevronRightIcon, GavelIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router'
import z from 'zod'
import { useAuctionColumns } from './components/columns'
import { DataTable } from './components/data-table'
import AuctionFilters from './components/filters'

const formSchema = z.object({
  auctionDateStart: z.string().optional(),
  auctionDateEnd: z.string().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  minRating: z.number().min(0).optional(),
  minDiscount: z.number().min(0).optional(),
  minProfitability: z.number().min(0).optional()
})

export default function MarketplaceAvailableAuctionsPage () {
  const auctionColumns = useAuctionColumns()
  const [searchParams, setSearchParams] = useSearchParams()

  const defaultForm = useMemo(() => ({
    auctionDateStart: searchParams.get('auctionDateStart') || undefined,
    auctionDateEnd: searchParams.get('auctionDateEnd') || undefined,
    minAmount: searchParams.get('minAmount') ? Number(searchParams.get('minAmount')) : undefined,
    maxAmount: searchParams.get('maxAmount') ? Number(searchParams.get('maxAmount')) : undefined,
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

  const [data, setData] = useState([])
  const [totalItems, setTotalItems] = useState(0)

  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  const [currentLimit, setCurrentLimit] = useState(parseInt(searchParams.get('limit') || '10', 10))

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

  useEffect(() => {
    const filters: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      if (key !== 'page' && key !== 'limit') {
        filters[key] = value
      }
    })

    getAuctions({
      ...filters,
      page: String(currentPage),
      limit: String(currentLimit)
    }).then(res => {
      setData(res.data)
      setTotalItems(res['_metadata'].total)
    })
  }, [searchParams, currentPage, currentLimit])

  function handleClear () {
    form.reset({
      auctionDateStart: undefined,
      auctionDateEnd: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      minRating: undefined,
      minDiscount: undefined,
      minProfitability: undefined
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
          <GavelIcon className='w-6 h-6' />
        </span>
        <h2>Subastas</h2>
      </div>
      <Dialog>
        <div className='hidden md:block'>
          <AuctionFilters form={form} onSubmit={onSubmit} handleClear={handleClear} />
        </div>

        <DialogContent className='max-h-svh overflow-scroll'>
          <DialogHeader className='font-bold text-lg'>
            Filtrar subastas
          </DialogHeader>
          <AuctionFilters form={form} onSubmit={onSubmit} handleClear={handleClear} />
        </DialogContent>

        <DataTable columns={auctionColumns} data={data} totalItems={totalItems} />
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
