import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import useLocale from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency'
import { AuctionStatus, type Auction } from '@/types/Auction'
import { ChevronLeftIcon, ChevronRightIcon, HistoryIcon, PercentIcon, TrendingUpIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { DataTable } from './data-table'

export default function MarketplaceAuctionBids ({auction}: {auction: Auction | undefined}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { locale } = useLocale()

  const isAuctionLive = auction?.status === AuctionStatus.LIVE

  const [bid, setBid] = useState('')

  const [data, setData] = useState([])
  const [totalItems, setTotalItems] = useState(0)

  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  const [currentLimit, setCurrentLimit] = useState(parseInt(searchParams.get('limit') || '10', 10))

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

  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const start = new Date(auction?.auctionDate.auctionDateStart || '').getTime()
  const rem = Math.max(0, start - now)
  const d = Math.floor(rem / 86_400_000)
  const h = Math.floor((rem % 86_400_000) / 3_600_000)
  const m = Math.floor((rem % 3_600_000) / 60_000)
  const s = Math.floor((rem % 60_000) / 1_000)
  const label = d > 0 ? `${d}d ${h}h ${m}m ${s}s` : h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`

  return (
    <Card className='flex flex-col lg:grid lg:grid-cols-[65%_auto] lg:grid-rows-1 flex-wrap gap-0 lg:divide-x pt-0 overflow-hidden relative'>
      <div>
        <CardHeader className='flex flex-row justify-between py-6'>
          <div className='flex items-center gap-2'>
            <span className='rounded-md p-1 bg-primary/20 text-primary'>
              <HistoryIcon className='w-4 h-4' />
            </span>
            <h3>Historial de pujas</h3>
          </div>

          <span className='text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-lg'>{totalItems} puja{totalItems !== 1 && 's'}</span>
        </CardHeader>
        <div className='flex flex-col gap-4 pb-6 xl:pb-0'>
          <DataTable columns={null} data={data} totalItems={totalItems} />

          <div className='flex items-center justify-between gap-2 px-6 text-accent-foreground'>
            <div className='flex items-center justify-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || !isAuctionLive}
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage * currentLimit >= totalItems || !isAuctionLive}
              >
                <ChevronRightIcon />
              </Button>
              Página {currentPage} de {Math.ceil(totalItems / currentLimit)}
            </div>
            <div className='flex items-center gap-2'>
              <Select value={String(currentLimit)} onValueChange={value => handleLimitChange(Number(value))} disabled={!isAuctionLive}>
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
      </div>

      <div className='flex flex-col divide-y'>
        <CardHeader className='flex flex-row py-4! bg-accent'>
          <div className='flex flex-col md:gap-5'>
            <h4>Precio actual</h4>
            <span className='text-4xl'>
              {formatCurrency(auction?.startingPrice ?? 0, locale )}
            </span>
          </div>
        </CardHeader>
        <div className='grid grid-cols-2 grid-rows-1 divide-x'>
          <div className='flex flex-col items-center text-sm py-4'>
            <span className='text-muted-foreground flex items-center gap-2'>
              <PercentIcon className='w-4 h-4 inline-block' />
              Descuento
            </span>
            <span className='ps-6 text-xl font-bold' title={`Descuento ${Number(auction?.discount).toFixed(2)}%`}>
              {Number(auction?.discount).toFixed(2)}%
            </span>
          </div>
          <div className='flex flex-col items-center text-sm py-4'>
            <span className='text-muted-foreground flex items-center gap-2'>
              <TrendingUpIcon className='w-4 h-4 inline-block' />
              Rentabilidad
            </span>
            <span className='ps-6 text-xl font-bold text-green-500 text-shadow-md' title={`Rentabilidad ${Number(auction?.profitability).toFixed(2)}%`}>
              {Number(auction?.profitability).toFixed(2)}%
            </span>
          </div>
        </div>
        <div className='grow flex flex-col gap-8 lg:gap-2 p-4 pb-0'>
          <InputGroup>
            <InputGroupInput placeholder='Tu oferta' type='number' min={100} step={100} disabled={!isAuctionLive} value={bid} onChange={e => setBid(e.target.value)} />
            <InputGroupAddon>
              €
            </InputGroupAddon>
          </InputGroup>
          <div className='flex gap-2 *:flex-1'>
            <Button variant='outline' disabled={!isAuctionLive} onClick={() => setBid('100')}>100</Button>
            <Button variant='outline' disabled={!isAuctionLive} onClick={() => setBid('250')}>250</Button>
            <Button variant='outline' disabled={!isAuctionLive} onClick={() => setBid('500')}>500</Button>
            <Button variant='outline' disabled={!isAuctionLive} onClick={() => setBid('1000')}>1000</Button>
          </div>
          <Button className='w-full mt-auto' disabled={!isAuctionLive}>Realizar oferta</Button>
        </div>
      </div>

      {(!auction || auction.status === AuctionStatus.PUBLISHED) && (
        <div className='absolute top-0 w-full h-full bg-white/20 backdrop-blur-md z-20 flex flex-col items-center justify-center'>
          {auction
            ? (
              <>
                <span>La subasta comenzará en:</span>
                <span className='font-bold text-2xl'>{label}</span>
              </>
            ) : (
              <Spinner className='size-8' />
            )}
        </div>
      )}
    </Card>
  )
}
