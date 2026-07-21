import fetchApi from '@/lib/fetchApi'
import { connectSocketIO, socketEmit } from '@/lib/socket.io'
import type { Bid } from '@/types/Bid'
import type { PaginatedResponse, ResponseOK } from '@/types/Response'
import type { Socket } from 'socket.io-client'

const base_url = import.meta.env.VITE_BASE_URL

export const getBids = async (queryParams?: Record<string, string>) => {
  const queryString = new URLSearchParams(queryParams).toString()
  return fetchApi<PaginatedResponse<Bid[]>>(`${base_url}/bids?${queryString}`, {
    method: 'GET'
  }, {
    reject: 'Error al cargar las pujas'
  })
}

export const getBid = async (bidId: string) => {
  return fetchApi<ResponseOK<Bid>>(`${base_url}/bids/${bidId}`, {
    method: 'GET'
  })
}

export const connectBidSocket = (
  auctionId: string,
  handlers: {
    onNewBid: (bidId: string) => void
    onViewerCount: (count: number) => void
  }
): Socket => {
  const socket = connectSocketIO('/auctions')

  socket.on('viewer-count', (count: number) => handlers.onViewerCount(count))
  socket.on('new-bid', (bidId: string) => handlers.onNewBid(bidId))
  socket.on('connect', () => {
    socket.emit('join-auction', { auctionId })
  })

  return socket
}

export const connectBalanceSocket = (
  handlers: {
    onBalanceUpdate: (reservedBalance: number) => void
  }
): Socket => {
  const socket = connectSocketIO('/auctions')

  socket.on('connect', () => socket.emit('join-balance'))
  socket.on('balance-update', ({ reservedBalance }: { reservedBalance: number }) =>
    handlers.onBalanceUpdate(reservedBalance)
  )

  return socket
}

export const placeBid = (socket: Socket, auctionId: string, amount: number): Promise<void> => {
  return socketEmit(socket, 'place-bid', { auctionId, amount }, { reject: 'Error al realizar la oferta' })
}
