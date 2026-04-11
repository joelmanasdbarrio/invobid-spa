import fetchApi from '@/lib/fetchApi'
import type { PaginatedResponse, ResponseKO, ResponseOK } from '@/types/Response'
import type { Investor } from '@/types/User'

const base_url = import.meta.env.VITE_BASE_URL

export const createInvestor = (body: FormData, onSuccess?: (response: ResponseOK<Investor>) => void, onReject?: (error: ResponseKO) => void) => {
  return fetchApi<ResponseOK<Investor>>(`${base_url}/auth/register/investor`, {
    method: 'POST',
    body
  }, {
    promise: 'Creando cuenta...',
    resolve: 'Cuenta creada con éxito',
    reject: 'Error al crear la cuenta'
  },
  onSuccess,
  onReject
  )
}

export const getInvestors = async (queryParams?: Record<string, string>) => {
  const queryString = new URLSearchParams(queryParams).toString()
  return fetchApi<PaginatedResponse<Investor[]>>(`${base_url}/investors?${queryString}`, {
    method: 'GET'
  }, {
    reject: 'Error al cargar los inversores'
  })
}

export const getInvestorById = async (investorId: string) => {
  return fetchApi<ResponseOK<Investor>>(`${base_url}/investors/${investorId}`, {
    method: 'GET'
  }, {
    reject: 'Error al cargar el inversor'
  })
}

export const updateInvestorById = async (investorId: string, body: FormData | string) => {
  const fetchOptions: RequestInit = {
    method: 'PATCH'
  }

  if (body instanceof FormData) {
    fetchOptions.body = body
  } else {
    fetchOptions.body = body
    fetchOptions.headers = { 'Content-Type': 'application/json' }
  }

  return fetchApi<ResponseOK<Investor>>(`${base_url}/investors/${investorId}`, fetchOptions, {
    promise: 'Actualizando inversor...',
    resolve: 'Inversor actualizado con éxito',
    reject: 'Error al actualizar el inversor'
  })
}

export const deleteInvestorById = async (investorId: string) => {
  return fetchApi<ResponseOK<null>>(`${base_url}/investors/${investorId}`, {
    method: 'DELETE'
  }, {
    promise: 'Eliminando inversor...',
    resolve: 'Inversor eliminado con éxito',
    reject: 'Error al eliminar el inversor'
  })
}

// Lookup service

export const countInvestors = async (queryParams?: Record<string, string>) => {
  const queryString = new URLSearchParams(queryParams).toString()
  return fetchApi<ResponseOK<number>>(`${base_url}/investors/lookup/count?${queryString}`, {
    method: 'GET'
  })
}
