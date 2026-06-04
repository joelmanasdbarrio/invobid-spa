import { ColorBadge } from '@/components/color-badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/hooks/use-locale'
import useLoggedInUser from '@/hooks/use-loggedInUser'
import { calcDiscount, calcProfitability, invertProfitability } from '@/lib/auction-metrics'
import { formatCurrency } from '@/lib/format-currency'
import { connectBidSocket, getBid, getBids, placeBid } from '@/services/bid.api'
import { AuctionStatus, type Auction } from '@/types/Auction'
import type { Bid } from '@/types/Bid'
import { EyeIcon, HistoryIcon, PercentIcon, ShieldCheckIcon, TrendingUpIcon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { useBidColumns } from './columns'
import { DataTable } from './data-table'

const PROFITABILITY_REDUCTIONS = [-0.1, -0.25, -0.5, -1]
const PAGE_LIMIT = 10

export function MarketplaceAuctionBids ({ auction, onAuctionExtended }: { auction: Auction | undefined; onAuctionExtended?: (newEndDate: string) => void }) {
  const { locale } = useLocale()
  const loggedInUser = useLoggedInUser()

  const isAuctionActive = auction?.status === AuctionStatus.PUBLISHED
  const isDisabled = !isAuctionActive || !auction || auction.invoice.sellerInvestor.id === loggedInUser?.id

  const [bidForm, setBidForm] = useState({ bidInput: '', bidInputInvalid: false, profitabilityInput: '', profitabilityInputInvalid: false })
  const { bidInput, bidInputInvalid, profitabilityInput, profitabilityInputInvalid } = bidForm
  const setBidInput = (v: string) => setBidForm(prev => ({ ...prev, bidInput: v }))
  const setBidInputInvalid = (v: boolean) => setBidForm(prev => ({ ...prev, bidInputInvalid: v }))
  const setProfitabilityInput = (v: string) => setBidForm(prev => ({ ...prev, profitabilityInput: v }))
  const setProfitabilityInputInvalid = (v: boolean) => setBidForm(prev => ({ ...prev, profitabilityInputInvalid: v }))

  const [bidsData, setBidsData] = useState({ bids: [] as Bid[], totalItems: 0, viewerCount: 0, currentPage: 1 })
  const { bids, totalItems, viewerCount, currentPage } = bidsData
  const setViewerCount = (v: number) => setBidsData(prev => ({ ...prev, viewerCount: v }))
  const socketRef = useRef<Socket | null>(null)

  const columns = useBidColumns()

  useEffect(() => {
    if (!auction?.id) return

    getBids({
      auctionId: auction.id,
      page: String(currentPage),
      limit: String(PAGE_LIMIT)
    }).then((res) => {
      setBidsData(prev => ({ ...prev, bids: [...prev.bids, ...res.data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), totalItems: res._metadata.total }))
    })
  }, [auction?.id, currentPage])

  useEffect(() => {
    if (!auction?.id) return

    const socket = connectBidSocket(auction.id, {
      onViewerCount: (count) => setViewerCount(count),
      onNewBid: async (bidId) => {
        if (onAuctionExtended && auction.date.end) {
          const extensionMs = Number(import.meta.env.VITE_AUCTION_EXTENSION_MINUTES) * 60 * 1000
          const endTime = new Date(auction.date.end).getTime()
          if (endTime - Date.now() <= extensionMs) {
            onAuctionExtended(new Date(Date.now() + extensionMs).toISOString())
          }
        }

        const newBid = await getBid(bidId).then(res => res.data)
        setBidsData(prev => ({ ...prev, bids: [newBid, ...prev.bids], totalItems: prev.totalItems + 1 }))
      }
    })
    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [auction, onAuctionExtended])

  const latestBidAmount = bids[0]?.amount ?? auction?.price?.start ?? 0
  const faceValue = auction?.invoice.amount ?? 0
  const buyerFeePercentage = auction?.invoice.transactionFee.buyerPercentage ?? 0
  const buyerFeeValue = bidInput ? Number(bidInput) * buyerFeePercentage / 100 : 0
  const currentProfitability = calcProfitability(faceValue, buyerFeePercentage, latestBidAmount)

  const minimumNextBid = latestBidAmount * (1 + Number(import.meta.env.VITE_SMALLEST_BID_INCREMENT_PERCENTAGE) / 100)
  const minimumNextRawBid = minimumNextBid / (1 + buyerFeePercentage / 100)

  const profitabilityReductionAmounts = PROFITABILITY_REDUCTIONS.map(delta => {
    if (faceValue <= 0) return 0
    const targetProfitability = currentProfitability + delta
    const rawBid = invertProfitability(faceValue, buyerFeePercentage, targetProfitability) / (1 + buyerFeePercentage / 100)
    return Math.max(Math.ceil(rawBid * 100) / 100, minimumNextRawBid)
  })

  const [hoverTotalPrice, setHoverTotalPrice] = useState<number | null>(null)

  const typedTotalPrice = bidInput && Number(bidInput) > 0 ? Number(bidInput) * (1 + buyerFeePercentage / 100) : null
  const displayDiscount = calcDiscount(faceValue, hoverTotalPrice ?? typedTotalPrice ?? latestBidAmount)
  const displayProfitability = calcProfitability(faceValue, buyerFeePercentage, hoverTotalPrice ?? typedTotalPrice ?? latestBidAmount)

  function handleBidInputChange (v: string) {
    const rounded = v && Number(v) > 0 ? String(Math.ceil(Number(v) * 100) / 100) : v
    setBidInput(rounded)
    setBidInputInvalid(false)
    if (rounded && faceValue > 0 && Number(rounded) > 0) {
      const totalPrice = Number(rounded) * (1 + buyerFeePercentage / 100)
      const delta = currentProfitability - calcProfitability(faceValue, buyerFeePercentage, totalPrice)
      setProfitabilityInput(delta > 0 ? delta.toFixed(2) : '')
    } else {
      setProfitabilityInput('')
    }
  }

  function handleProfitabilityInputChange (v: string) {
    setProfitabilityInput(v)
    setProfitabilityInputInvalid(false)
    if (v && faceValue > 0) {
      const targetProfitability = currentProfitability - Number(v)
      const rawBid = invertProfitability(faceValue, buyerFeePercentage, targetProfitability) / (1 + buyerFeePercentage / 100)
      const amount = Math.max(Math.ceil(rawBid * 100) / 100, minimumNextRawBid)
      setBidInput(String(amount))
      setBidInputInvalid(false)
    } else {
      setBidInput('')
    }
  }

  function clearInputs () {
    setBidForm({ bidInput: '', bidInputInvalid: false, profitabilityInput: '', profitabilityInputInvalid: false })
  }

  function handlePlaceBid () {
    if (!socketRef.current || !auction?.id) return
    placeBid(socketRef.current, auction.id, Number(bidInput))
      .then(() => clearInputs())
      .catch(() => { setBidForm(prev => ({ ...prev, bidInputInvalid: true, profitabilityInputInvalid: true })) })
  }

  function calcPreview (amount: number) {
    setHoverTotalPrice(amount * (1 + buyerFeePercentage / 100))
  }

  function clearPreview () {
    setHoverTotalPrice(null)
  }

  return (
    <Card className='flex flex-col lg:grid lg:grid-cols-[65%_auto] lg:grid-rows-1 flex-wrap gap-0 lg:divide-x pt-0 overflow-hidden relative'>
      <div className='w-full'>
        <CardHeader className='flex flex-row items-center justify-between py-6'>
          <div className='flex items-center gap-2'>
            <span className='rounded-md p-1 bg-primary/20 text-primary'>
              <HistoryIcon className='size-4' />
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
        <div className='flex flex-col'>
          <DataTable columns={columns} data={bids} totalItems={totalItems} onLoadMore={() => setBidsData(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))} />
        </div>
      </div>

      <div className='flex flex-col divide-y w-full'>
        <CardHeader className='flex flex-row py-4! bg-accent justify-between'>
          <div className='flex flex-col md:gap-5'>
            <h4>Precio actual</h4>
            <div className='flex flex-col gap-2'>
              <span className='text-2xl lg:text-4xl'>
                {formatCurrency(latestBidAmount, locale, auction?.invoice.currency)}
              </span>
              <span className='line-through lg:text-lg'>
                {formatCurrency(auction?.invoice.amount ?? 0, locale, auction?.invoice.currency)}
              </span>
            </div>
          </div>
          <div className='flex flex-col gap-4 items-center justify-center h-full'>
            <Tooltip>
              <TooltipTrigger>
                <ColorBadge
                  color={(auction?.invoice.rating ?? 0) >= 4.9 ? 'green' : (auction?.invoice.rating ?? 0) >= 4.5 ? 'yellow' : 'red'}
                  icon={<ShieldCheckIcon className='size-4 lg:size-8' />}
                  className='px-4 rounded-full'
                >
                  <span title={`Rating ${auction?.invoice.rating}`} className='lg:text-lg font-bold'>
                    {auction?.invoice.rating}
                  </span>
                </ColorBadge>
              </TooltipTrigger>
              <TooltipContent className='text-center'>Rating de la factura basado en el estudio de solvencia<br />del deudor, proporcionado por {import.meta.env.VITE_APP_NAME}.</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <ColorBadge
                  color={(auction?.invoice.extRating ?? 0) >= 4.9 ? 'green' : (auction?.invoice.extRating ?? 0) >= 4.5 ? 'yellow' : 'red'}
                  icon={<ShieldCheckIcon className='size-4 lg:size-8' />}
                  className='px-4 rounded-full'
                >
                  <span title={`Rating ${auction?.invoice.extRating}`} className='lg:text-lg font-bold'>
                    {auction?.invoice.extRating}
                  </span>
                </ColorBadge>
              </TooltipTrigger>
              <TooltipContent className='text-center'>Rating de la factura basado en el estudio de solvencia<br />del deudor, proporcionado por {import.meta.env.VITE_EXT_RATING_PROVIDER}.</TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <div className='grid grid-cols-2 grid-rows-1 divide-x'>
          <div className='flex flex-col items-center text-sm py-4'>
            <span className='text-muted-foreground flex items-center gap-2'>
              <PercentIcon className='size-4 inline-block' />
              Descuento
            </span>
            <span className='ps-6 text-xl font-bold' title={`Descuento ${displayDiscount.toFixed(2)}%`}>
              {displayDiscount.toFixed(2)}%
            </span>
          </div>
          <div className='flex flex-col items-center text-sm py-4'>
            <span className='text-muted-foreground flex items-center gap-2'>
              <TrendingUpIcon className='size-4 inline-block' />
              Rentabilidad
            </span>
            <span className='ps-6 text-xl font-bold text-green-500 text-shadow-md' title={`Rentabilidad ${displayProfitability.toFixed(2)}%`}>
              {displayProfitability.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className='grow flex flex-col gap-2 p-4 pb-0'>
          <div className='grid lg:grid-cols-2 lg:grid-rows-1 gap-2'>
            <InputGroup>
              <InputGroupInput placeholder='Valor final' type='number' min={minimumNextRawBid} step={100} disabled={isDisabled} value={bidInput} aria-invalid={bidInputInvalid} onChange={e => handleBidInputChange(e.target.value)} />
              <InputGroupAddon align='inline-end'>
                €
              </InputGroupAddon>
              <InputGroupAddon align='inline-end'>
                <Button variant='ghost' size='icon' disabled={!bidInput} onClick={clearInputs}>
                  <XIcon className='size-4 cursor-pointer' />
                </Button>
              </InputGroupAddon>
            </InputGroup>
            <InputGroup>
              <InputGroupInput placeholder='Rentabilidad' type='number' min={PROFITABILITY_REDUCTIONS[0]} step={0.01} disabled={isDisabled} value={profitabilityInput} aria-invalid={profitabilityInputInvalid} onChange={e => handleProfitabilityInputChange(e.target.value)} />
              <InputGroupAddon>
                -
              </InputGroupAddon>
              <InputGroupAddon align='inline-end'>
                %
              </InputGroupAddon>
              <InputGroupAddon align='inline-end'>
                <Button variant='ghost' size='icon' disabled={!profitabilityInput} onClick={clearInputs}>
                  <XIcon className='size-4 cursor-pointer' />
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div className='text-xs text-muted-foreground flex items-center justify-end gap-4'>
            <span>Comisión ({buyerFeePercentage}%):</span>
            <span>+{buyerFeeValue.toFixed(2)}€</span>
          </div>
          <div className='flex flex-col gap-1'>
            <span className='text-xs text-muted-foreground'>Rentabilidad rápida:</span>
            <div className='flex gap-2 *:flex-1'>
              {PROFITABILITY_REDUCTIONS.map((delta, i) => (
                <Button
                  key={delta}
                  variant='outline'
                  disabled={isDisabled}
                  onClick={() => handleBidInputChange(String(profitabilityReductionAmounts[i]))}
                  onMouseEnter={() => calcPreview(profitabilityReductionAmounts[i])}
                  onMouseLeave={clearPreview}
                >
                  {delta}%
                </Button>
              ))}
            </div>
          </div>
          <Button
            className='w-full mt-auto'
            disabled={isDisabled || !bidInput}
            onClick={handlePlaceBid}
          >
            Realizar oferta
          </Button>
        </div>
      </div>

      {(!auction || !isAuctionActive) && auction !== undefined && (
        <div className='absolute top-0 w-full h-full bg-white/20 backdrop-blur-md z-20 flex flex-col items-center justify-center'>
          <span>La subasta ha finalizado</span>
        </div>
      )}

      {!auction && (
        <div className='absolute top-0 w-full h-full bg-white/20 backdrop-blur-md z-20 flex flex-col items-center justify-center'>
          <Spinner className='size-8' />
        </div>
      )}
    </Card>
  )
}
