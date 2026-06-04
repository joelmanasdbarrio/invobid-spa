import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import useLoggedInUser from '@/hooks/use-loggedInUser'
import { getAuctions } from '@/services/auction.api'
import { type Auction, AuctionStatus } from '@/types/Auction'
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
  invoiceSvc: z.string().optional(),
  sellerCompanyName: z.string().optional(),
  buyerCompanyName: z.string().optional(),
  debtorCompanyName: z.string().optional(),
  maxAmount: z.number().positive().optional(),
  minAmount: z.number().positive().optional(),
  auctionDateStart: z.string().optional(),
  auctionDateEnd: z.string().optional(),
  status: z.enum(AuctionStatus).optional(),
  includeDeleted: z.boolean().default(false).optional()
})

export default function AuctionsPage () {
  const auctionColumns = useAuctionColumns()
  const [searchParams, setSearchParams] = useSearchParams()

  const defaultForm = useMemo(() => ({
    invoiceSvc: searchParams.get('invoiceSvc') || undefined,
    sellerCompanyName: searchParams.get('sellerCompanyName') || undefined,
    buyerCompanyName: searchParams.get('buyerCompanyName') || undefined,
    debtorCompanyName: searchParams.get('debtorCompanyName') || undefined,
    maxAmount: searchParams.get('maxAmount') ? Number(searchParams.get('maxAmount')) : undefined,
    minAmount: searchParams.get('minAmount') ? Number(searchParams.get('minAmount')) : undefined,
    auctionDateStart: searchParams.get('auctionDateStart') || undefined,
    auctionDateEnd: searchParams.get('auctionDateEnd') || undefined,
    status: searchParams.get('status') as AuctionStatus || undefined,
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

  const [data, setData] = useState<Auction[]>([])
  const [totalItems, setTotalItems] = useState<number>(0)

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
    if (!loggedInUser) return

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

    getAuctions({
      ...filters,
      sellerInvestorId: loggedInUser.id,
      includeSelf: String(1),
      page: String(currentPage),
      limit: String(currentLimit)
    }).then(res => {
      setData(res.data)
      setTotalItems(res._metadata.total)
    })
  }, [loggedInUser, searchParams, currentPage, currentLimit])

  function handleClear () {
    form.reset(defaultForm)
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
          <GavelIcon className='size-6' />
        </span>
        <h2>Consultar subastas</h2>
      </div>
      <Dialog>
        <div className='hidden md:block'>
          <AuctionFilters form={form} onSubmit={onSubmit} handleClear={handleClear} />
        </div>

        <DialogContent className='max-h-svh overflow-scroll'>
          <DialogHeader className='font-bold text-lg'>
            Filtrar usuarios
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
