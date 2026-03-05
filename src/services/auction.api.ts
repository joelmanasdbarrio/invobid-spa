import fetchApi from '@/lib/fetchApi'

const base_url = import.meta.env.VITE_BASE_URL

export const createAuction = async (body: FormData) => {
  return fetchApi(`${base_url}/auctions`, {
    method: 'POST',
    body
  }, {
    promise: 'Creando subasta...',
    resolve: 'Subasta creada con éxito',
    reject: 'Error al crear la subasta'
  })
}

export const getAuctions = async (queryParams?: Record<string, string>) => {
  const queryString = new URLSearchParams(queryParams).toString()
  return fetchApi(`${base_url}/auctions?${queryString}`, {
    method: 'GET'
  }, {
    reject: 'Error al cargar las subastas'
  })
}

export const getAuctionById = async (auctionId: string) => {
  return fetchApi(`${base_url}/auctions/${auctionId}`, {
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

  return fetchApi(`${base_url}/auctions/${auctionId}`, fetchOptions, {
    promise: 'Actualizando subasta...',
    resolve: 'Subasta actualizada con éxito',
    reject: 'Error al actualizar la subasta'
  })
}

// Lookup service

export const countAuctions = async (queryParams?: Record<string, string>) => {
  const queryString = new URLSearchParams(queryParams).toString()
  return fetchApi(`${base_url}/auctions/lookup/count?${queryString}`, {
    method: 'GET'
  })
}
