import fetchApi from '@/lib/fetchApi'
import type { Bid } from '@/types/Bid'

const base_url = import.meta.env.VITE_BASE_URL

export const getBids = async (queryParams?: Record<string, string>) => {
  const queryString = new URLSearchParams(queryParams).toString()
  return fetchApi<{
    status: string;
    data: Bid[];
    _metadata: { total: number; length: number; page: number; limit: number };
  }>(`${base_url}/bid?${queryString}`, {
    method: 'GET'
  }, {
    reject: 'Error al cargar las pujas'
  })
}
