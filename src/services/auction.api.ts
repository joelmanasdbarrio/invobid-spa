import fetchApi from '@/lib/fetchApi'
import { type Auction } from '@/types/Auction'
import { type PaginatedResponse, type ResponseOK } from '@/types/Response'

const base_url = import.meta.env.VITE_BASE_URL

export const createAuction = async (body: FormData | string) => {
  const fetchOptions: RequestInit = {
    method: 'POST'
  }

  if (body instanceof FormData) {
    fetchOptions.body = body
  } else {
    fetchOptions.body = body
    fetchOptions.headers = { 'Content-Type': 'application/json' }
  }

  return fetchApi<ResponseOK<Auction>>(`${base_url}/auctions`, fetchOptions, {
    promise: 'Creando subasta...',
    resolve: 'Subasta creada con éxito',
    reject: 'Error al crear la subasta'
  })
}

export const getAuctions = async (queryParams?: Record<string, string>) => {
  const queryString = new URLSearchParams(queryParams).toString()
  return fetchApi<PaginatedResponse<Auction[]>>(`${base_url}/auctions?${queryString}`, {
    method: 'GET'
  }, {
    reject: 'Error al cargar las subastas'
  })
}

export const getAuctionById = async (auctionId: string) => {
  return fetchApi<ResponseOK<Auction>>(`${base_url}/auctions/${auctionId}`, {
    method: 'GET'
  }, {
    reject: 'Error al cargar la subasta'
  })
}

export const updateAuctionById = async (auctionId: string, body: FormData | string) => {
  const fetchOptions: RequestInit = {
    method: 'PATCH'
  }

  if (body instanceof FormData) {
    fetchOptions.body = body
  } else {
    fetchOptions.body = body
    fetchOptions.headers = { 'Content-Type': 'application/json' }
  }

  return fetchApi<ResponseOK<Auction>>(`${base_url}/auctions/${auctionId}`, fetchOptions, {
    promise: 'Actualizando subasta...',
    resolve: 'Subasta actualizada con éxito',
    reject: 'Error al actualizar la subasta'
  })
}

// Lookup service

export const countAuctions = async (queryParams?: Record<string, string>) => {
  const queryString = new URLSearchParams(queryParams).toString()
  return fetchApi<ResponseOK<number>>(`${base_url}/auctions/lookup/count?${queryString}`, {
    method: 'GET'
  })
}
