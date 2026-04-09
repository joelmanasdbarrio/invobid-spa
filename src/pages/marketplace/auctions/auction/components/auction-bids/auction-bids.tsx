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
import { connectSocketIO, socketEmit } from '@/lib/socket.io'
import { getBids } from '@/services/bid.api'
import { AuctionStatus, type Auction } from '@/types/Auction'
import type { Bid } from '@/types/Bid'
import { EyeIcon, HistoryIcon, PercentIcon, ShieldCheckIcon, TrendingUpIcon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { useBidColumns } from './columns'
import { DataTable } from './data-table'

export function MarketplaceAuctionBids ({auction}: {auction: Auction | undefined}) {
  const { locale } = useLocale()
  const loggedInUser = useLoggedInUser()

  const isAuctionActive = auction?.status === AuctionStatus.PUBLISHED
  const isDisabled = !isAuctionActive || !auction || auction.invoice.sellerInvestor.id === loggedInUser?.id

  const [bidInput, setBidInput] = useState('')
  const [bidInputInvalid, setBidInputInvalid] = useState(false)
  const [profitabilityInput, setProfitabilityInput] = useState('')
  const [profitabilityInputInvalid, setProfitabilityInputInvalid] = useState(false)

  const [bids, setBids] = useState<Bid[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [viewerCount, setViewerCount] = useState(0)
  const socketRef = useRef<Socket | null>(null)

  const columns = useBidColumns()

  const [currentPage, setCurrentPage] = useState(1)
  const [currentLimit] = useState(10)

  useEffect(() => {
    if (!auction?.id) return

    getBids({
      auctionId: auction.id,
      page: String(currentPage),
      limit: String(currentLimit)
    }).then((res) => {
      setBids((prev) => [...prev, ...res.data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      setTotalItems(res._metadata.total)
    })
  }, [auction?.id, currentPage, currentLimit])

  useEffect(() => {
    if (!auction?.id) return

    const s = connectSocketIO('/auctions')
    socketRef.current = s

    s.on('viewer-count', (count: number) => setViewerCount(count))
    s.on('new-bid', (newBid: Bid) => {
      setBids((prev) => [newBid, ...prev])
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

  const latestBidAmount = bids[0]?.amount ?? auction?.price?.start ?? 0
  const faceValue = auction?.invoice.amount ?? 0
  const buyerPercentage = auction?.invoice.transactionFee.buyerPercentage ?? 0
  const currentDiscount = calcDiscount(faceValue, latestBidAmount)
  const currentProfitability = calcProfitability(faceValue, buyerPercentage, latestBidAmount)

  const profitabilityReductions = [-0.1, -0.25, -0.5, -1]
  const profitabilityReductionAmounts = profitabilityReductions.map(delta => {
    if (faceValue <= 0) return 0
    const targetProfitability = currentProfitability + delta
    return Math.max(Math.ceil(invertProfitability(faceValue, buyerPercentage, targetProfitability) * 100) / 100, latestBidAmount)
  })

  const [previewDiscount, setPreviewDiscount] = useState<number | null>(null)
  const [previewProfitability, setPreviewProfitability] = useState<number | null>(null)

  const previewAmount = bidInput ? Number(bidInput) : null
  const previewInputDiscount = previewAmount !== null && faceValue > 0 ? calcDiscount(faceValue, previewAmount) : null
  const previewInputProfitability = previewAmount !== null && faceValue > 0 && previewAmount > 0 ? calcProfitability(faceValue, buyerPercentage, previewAmount) : null

  const displayDiscount = previewDiscount ?? previewInputDiscount ?? currentDiscount
  const displayProfitability = previewProfitability ?? previewInputProfitability ?? currentProfitability

  function handleBidInputChange (v: string) {
    setBidInput(v)
    setBidInputInvalid(false)
    if (v && faceValue > 0 && Number(v) > 0) {
      const delta = currentProfitability - calcProfitability(faceValue, buyerPercentage, Number(v))
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
      const amount = Math.ceil(invertProfitability(faceValue, buyerPercentage, targetProfitability) * 100) / 100
      setBidInput(String(amount))
      setBidInputInvalid(false)
    } else {
      setBidInput('')
    }
  }

  function clearInputs () {
    setBidInput('')
    setBidInputInvalid(false)
    setProfitabilityInput('')
    setProfitabilityInputInvalid(false)
  }

  function handlePlaceBid () {
    if (!socketRef.current || !auction?.id) return
    socketEmit(socketRef.current, 'place-bid', { auctionId: auction.id, amount: Number(bidInput) }, { reject: 'Error al realizar la oferta' })
      .then(() => clearInputs())
      .catch(() => { setBidInputInvalid(true); setProfitabilityInputInvalid(true) })
  }

  function calcPreview (amount: number) {
    setPreviewDiscount(calcDiscount(faceValue, amount))
    setPreviewProfitability(calcProfitability(faceValue, buyerPercentage, amount))
  }

  function clearPreview () {
    setPreviewDiscount(null)
    setPreviewProfitability(null)
  }

  return (
    <Card className='flex flex-col lg:grid lg:grid-cols-[65%_auto] lg:grid-rows-1 flex-wrap gap-0 lg:divide-x pt-0 overflow-hidden relative'>
      <div className='w-full'>
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
        <div className='flex flex-col'>
          <DataTable columns={columns} data={bids} totalItems={totalItems} onLoadMore={() => setCurrentPage(currentPage + 1)} />
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
                {formatCurrency(auction?.invoice.amount, locale, auction?.invoice.currency)}
              </span>
            </div>
          </div>
          <div className='flex flex-col gap-4 items-center justify-center h-full'>
            <Tooltip>
              <TooltipTrigger>
                <ColorBadge
                  color={auction?.invoice.rating >= 4.9 ? 'green' : auction?.invoice.rating >= 4.5 ? 'yellow' : 'red'}
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
                  color={auction?.invoice.extRating >= 4.9 ? 'green' : auction?.invoice.extRating >= 4.5 ? 'yellow' : 'red'}
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
          <div className='grid lg:grid-cols-2 lg:grid-rows-1 gap-2'>
            <InputGroup>
              <InputGroupInput placeholder='Valor final' type='number' min={latestBidAmount} step={100} disabled={isDisabled} value={bidInput} aria-invalid={bidInputInvalid} onChange={e => handleBidInputChange(e.target.value)} />
              <InputGroupAddon align='inline-end'>
                €
              </InputGroupAddon>
              <InputGroupAddon align='inline-end'>
                <Button variant='ghost' size='icon' disabled={!bidInput} onClick={clearInputs}>
                  <XIcon className='w-4 h-4 cursor-pointer' />
                </Button>
              </InputGroupAddon>
            </InputGroup>
            <InputGroup>
              <InputGroupInput placeholder='Rentabilidad' type='number' min={profitabilityReductions[0]} step={0.01} disabled={isDisabled} value={profitabilityInput} aria-invalid={profitabilityInputInvalid} onChange={e => handleProfitabilityInputChange(e.target.value)} />
              <InputGroupAddon>
                -
              </InputGroupAddon>
              <InputGroupAddon align='inline-end'>
                %
              </InputGroupAddon>
              <InputGroupAddon align='inline-end'>
                <Button variant='ghost' size='icon' disabled={!profitabilityInput} onClick={clearInputs}>
                  <XIcon className='w-4 h-4 cursor-pointer' />
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div className='flex flex-col gap-1'>
            <span className='text-xs text-muted-foreground'>Rentabilidad rápida:</span>
            <div className='flex gap-2 *:flex-1'>
              {profitabilityReductions.map((delta, i) => (
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
