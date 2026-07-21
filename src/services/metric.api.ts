import fetchApi from '@/lib/fetchApi'
import type { ResponseOK } from '@/types/Response'

const base_url = import.meta.env.VITE_BASE_URL

export const getMetric = async <T = never>(id: string) => {
  return fetchApi<ResponseOK<T>>(`${base_url}/metrics/${id}`, {
    method: 'GET'
  }, {
    reject: `Error al cargar métrica ${id}`
  })
}
