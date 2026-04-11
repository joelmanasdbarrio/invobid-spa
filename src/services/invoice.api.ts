import fetchApi from '@/lib/fetchApi'
import type { Invoice } from '@/types/Invoice'
import type { PaginatedResponse, ResponseOK } from '@/types/Response'

const base_url = import.meta.env.VITE_BASE_URL

export const createInvoice = async (body: FormData) => {
  return fetchApi<ResponseOK<Invoice>>(`${base_url}/invoices`, {
    method: 'POST',
    body
  }, {
    promise: 'Creando factura...',
    resolve: 'Factura creada con éxito',
    reject: 'Error al crear la factura'
  })
}

export const getInvoices = async (queryParams?: Record<string, string>) => {
  const queryString = new URLSearchParams(queryParams).toString()
  return fetchApi<PaginatedResponse<Invoice[]>>(`${base_url}/invoices?${queryString}`, {
    method: 'GET'
  }, {
    reject: 'Error al cargar las facturas'
  })
}

export const getInvoiceById = async (svc: string) => {
  return fetchApi<ResponseOK<Invoice>>(`${base_url}/invoices/${svc}`, {
    method: 'GET'
  }, {
    reject: 'Error al cargar la factura'
  })
}

export const updateInvoiceById = async (svc: string, body: FormData | string) => {
  const fetchOptions: RequestInit = {
    method: 'PATCH'
  }

  if (body instanceof FormData) {
    fetchOptions.body = body
  } else {
    fetchOptions.body = body
    fetchOptions.headers = { 'Content-Type': 'application/json' }
  }

  return fetchApi<ResponseOK<Invoice>>(`${base_url}/invoices/${svc}`, fetchOptions, {
    promise: 'Actualizando factura...',
    resolve: 'Factura actualizada con éxito',
    reject: 'Error al actualizar la factura'
  })
}

// Lookup service

export const countInvoices = async (queryParams?: Record<string, string>) => {
  const queryString = new URLSearchParams(queryParams).toString()
  return fetchApi<ResponseOK<number>>(`${base_url}/invoices/lookup/count?${queryString}`, {
    method: 'GET'
  })
}
