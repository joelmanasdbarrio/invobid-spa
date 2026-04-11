import fetchApi from '@/lib/fetchApi'
import type { Debtor } from '@/types/Debtor'
import type { PaginatedResponse, ResponseOK } from '@/types/Response'

const base_url = import.meta.env.VITE_BASE_URL

export const createDebtor = async (body: FormData) => {
  return fetchApi<ResponseOK<Debtor>>(`${base_url}/debtors`, {
    method: 'POST',
    body
  }, {
    promise: 'Creando deudor...',
    resolve: 'Deudor creado con éxito',
    reject: 'Error al crear el deudor'
  })
}

export const getDebtors = async (queryParams?: Record<string, string>) => {
  const queryString = new URLSearchParams(queryParams).toString()
  return fetchApi<PaginatedResponse<Debtor[]>>(`${base_url}/debtors?${queryString}`, {
    method: 'GET'
  }, {
    reject: 'Error al cargar los deudores'
  })
}

export const getDebtorById = async (debtorId: string) => {
  return fetchApi<ResponseOK<Debtor>>(`${base_url}/debtors/${debtorId}`, {
    method: 'GET'
  }, {
    reject: 'Error al cargar el deudor'
  })
}

export const updateDebtorById = async (debtorId: string, body: FormData | string) => {
  const fetchOptions: RequestInit = {
    method: 'PATCH'
  }

  if (body instanceof FormData) {
    fetchOptions.body = body
  } else {
    fetchOptions.body = body
    fetchOptions.headers = { 'Content-Type': 'application/json' }
  }

  return fetchApi<ResponseOK<Debtor>>(`${base_url}/debtors/${debtorId}`, fetchOptions, {
    promise: 'Actualizando deudor...',
    resolve: 'Deudor actualizado con éxito',
    reject: 'Error al actualizar el deudor'
  })
}

// Lookup service

export const countDebtors = async (queryParams?: Record<string, string>) => {
  const queryString = new URLSearchParams(queryParams).toString()
  return fetchApi<ResponseOK<number>>(`${base_url}/debtors/lookup/count?${queryString}`, {
    method: 'GET'
  })
}
