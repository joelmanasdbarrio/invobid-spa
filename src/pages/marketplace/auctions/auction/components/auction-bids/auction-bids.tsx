import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { useLocale } from '@/hooks/use-locale'
import { calcDiscount, calcProfitability, invertProfitability } from '@/lib/auction-metrics'
import { formatCurrency } from '@/lib/format-currency'
import { formatCountdown } from '@/lib/format-date'
import { connectSocketIO, socketEmit } from '@/lib/socket.io'
import { getBids } from '@/services/bid.api'
import { AuctionStatus, type Auction } from '@/types/Auction'
import type { Bid } from '@/types/Bid'
import { EyeIcon, HistoryIcon, PercentIcon, TrendingUpIcon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { useBidColumns } from './columns'
import { DataTable } from './data-table'

export function MarketplaceAuctionBids ({auction}: {auction: Auction | undefined}) {
  const { locale } = useLocale()

  const isAuctionLive = auction?.status === AuctionStatus.LIVE

  const [bid, setBid] = useState('')
  const [bidInvalid, setBidInvalid] = useState(false)

  const [data, setData] = useState<Bid[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [viewerCount, setViewerCount] = useState(0)
  const socketRef = useRef<Socket | null>(null)

  const columns = useBidColumns()

  const [currentPage, setCurrentPage] = useState(1)
  const [currentLimit] = useState(10)

  function handlePageChange (newPage: number) {
    setCurrentPage(newPage)
    setSearchParams(newParams)
  }

  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!auction?.id) return

    getBids({
      auctionId: auction.id,
      page: String(currentPage),
      limit: String(currentLimit)
    }).then((res) => {
      setData((prev) => [...prev, ...res.data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      setTotalItems(res._metadata.total)
    })
  }, [auction?.id, currentPage, currentLimit])

  useEffect(() => {
    if (!auction?.id) return

    const s = connectSocketIO('/auctions')
    socketRef.current = s

    s.on('viewer-count', (count: number) => setViewerCount(count))
    s.on('new-bid', (newBid: Bid) => {
      setData((prev) => [newBid, ...prev])
      setTotalItems((prev) => prev + 1)
    })

    s.on('connect', () => {
      s.emit('join-auction', { auctionId: auction.id })
    })

    return () => {
      s.disconnect()
      socketRef.current = null
    }
  }, [auction?.id])

  const latestBidAmount = data[0]?.amount ?? auction?.startingPrice ?? 0
  const faceValue = auction?.invoice.amount ?? 0
  const buyerPercentage = auction?.invoice.transactionFee.buyerPercentage ?? 0
  const currentDiscount = calcDiscount(faceValue, latestBidAmount)
  const currentProfitability = calcProfitability(faceValue, buyerPercentage, latestBidAmount)

  const quickBidDeltas = [-0.5, -1, -3, -5] as const
  const quickBidAmounts = quickBidDeltas.map(delta => {
    if (faceValue <= 0) return 0
    const targetProfitability = currentProfitability + delta
    return Math.max(Math.ceil(invertProfitability(faceValue, buyerPercentage, targetProfitability) * 100) / 100, latestBidAmount)
  })

  const [previewDiscount, setPreviewDiscount] = useState<number | null>(null)
  const [previewProfitability, setPreviewProfitability] = useState<number | null>(null)

  const inputAmount = bid ? Number(bid) : null
  const inputDiscount = inputAmount !== null && faceValue > 0 ? calcDiscount(faceValue, inputAmount) : null
  const inputProfitability = inputAmount !== null && faceValue > 0 && inputAmount > 0 ? calcProfitability(faceValue, buyerPercentage, inputAmount) : null

  const displayDiscount = previewDiscount ?? inputDiscount ?? currentDiscount
  const displayProfitability = previewProfitability ?? inputProfitability ?? currentProfitability

  function calcPreview (amount: number) {
    setPreviewDiscount(calcDiscount(faceValue, amount))
    setPreviewProfitability(calcProfitability(faceValue, buyerPercentage, amount))
  }

  function clearPreview () {
    setPreviewDiscount(null)
    setPreviewProfitability(null)
  }

  const start = new Date(auction?.auctionDate.auctionDateStart || '').getTime()
  const label = formatCountdown(start - now)

  return (
    <Card className='flex flex-col lg:grid lg:grid-cols-[65%_auto] lg:grid-rows-1 flex-wrap gap-0 lg:divide-x pt-0 overflow-hidden relative'>
      <div>
        <CardHeader className='flex flex-row items-center justify-between py-6'>
          <div className='flex items-center gap-2'>
            <span className='rounded-md p-1 bg-primary/20 text-primary'>
              <HistoryIcon className='w-4 h-4' />
            </span>
            <h3>Historial de pujas</h3>
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-lg'>{totalItems} puja{totalItems !== 1 && 's'}</span>
            <span className='flex items-center gap-1 text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-lg'>
              <EyeIcon className='size-3' />
              {viewerCount}
            </span>
          </div>
        </CardHeader>
        <div className='flex flex-col gap-4 pb-6 xl:pb-0'>
          <DataTable columns={columns} data={data} totalItems={totalItems} onLoadMore={() => handlePageChange(currentPage + 1)} />
        </div>
      </div>

      <div className='flex flex-col divide-y'>
        <CardHeader className='flex flex-row py-4! bg-accent'>
          <div className='flex flex-col md:gap-5'>
            <h4>Precio actual</h4>
            <span className='text-4xl'>
              {formatCurrency(latestBidAmount, locale)}
            </span>
          </div>
        </CardHeader>
        <div className='grid grid-cols-2 grid-rows-1 divide-x'>
          <div className='flex flex-col items-center text-sm py-4'>
            <span className='text-muted-foreground flex items-center gap-2'>
              <PercentIcon className='w-4 h-4 inline-block' />
              Descuento
            </span>
            <span className='ps-6 text-xl font-bold' title={`Descuento ${displayDiscount.toFixed(2)}%`}>
              {displayDiscount.toFixed(2)}%
            </span>
          </div>
          <div className='flex flex-col items-center text-sm py-4'>
            <span className='text-muted-foreground flex items-center gap-2'>
              <TrendingUpIcon className='w-4 h-4 inline-block' />
              Rentabilidad
            </span>
            <span className='ps-6 text-xl font-bold text-green-500 text-shadow-md' title={`Rentabilidad ${displayProfitability.toFixed(2)}%`}>
              {displayProfitability.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className='grow flex flex-col gap-2 p-4 pb-0'>
          <InputGroup>
            <InputGroupInput placeholder='Tu oferta' type='number' min={latestBidAmount} step={100} disabled={!isAuctionLive} value={bid} aria-invalid={bidInvalid} onChange={e => { setBid(e.target.value); setBidInvalid(false) }} />
            <InputGroupAddon>
              €
            </InputGroupAddon>
            <InputGroupAddon align='inline-end'>
              <Button variant='ghost' size='icon' disabled={!bid} onClick={() => setBid('')}>
                <XIcon className='w-4 h-4 cursor-pointer' />
              </Button>
            </InputGroupAddon>
          </InputGroup>
          <div className='flex flex-col gap-1'>
            <span className='text-xs text-muted-foreground'>Rentabilidad rápida:</span>
            <div className='flex gap-2 *:flex-1'>
              {quickBidDeltas.map((delta, i) => (
                <Button
                  key={delta}
                  variant='outline'
                  disabled={!isAuctionLive}
                  onClick={() => setBid(String(quickBidAmounts[i]))}
                  onMouseEnter={() => calcPreview(quickBidAmounts[i])}
                  onMouseLeave={clearPreview}
                >
                  {delta}%
                </Button>
              ))}
            </div>
          </div>
          <Button
            className='w-full mt-auto'
            disabled={!isAuctionLive || !bid}
            onClick={() => {
              if (!socketRef.current || !auction?.id) return
              socketEmit(socketRef.current, 'place-bid', { auctionId: auction.id, amount: Number(bid) }, { reject: 'Error al realizar la oferta' })
                .then(() => { setBid(''); setBidInvalid(false) })
                .catch(() => setBidInvalid(true))
            }}
          >
            Realizar oferta
          </Button>
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
