import fetchApi from '@/lib/fetchApi'
import type { Bid } from '@/types/Bid'
import type { PaginatedResponse } from '@/types/Response'

const base_url = import.meta.env.VITE_BASE_URL

export const getBids = async (queryParams?: Record<string, string>) => {
  const queryString = new URLSearchParams(queryParams).toString()
  return fetchApi<PaginatedResponse<Bid[]>>(`${base_url}/bids?${queryString}`, {
    method: 'GET'
  }, {
    reject: 'Error al cargar las pujas'
  })
}
