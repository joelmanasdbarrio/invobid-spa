import fetchApi from '@/lib/fetchApi'

const base_url = import.meta.env.VITE_BASE_URL

export const createDebtor = async (body: FormData) => {
  return fetchApi(`${base_url}/debtors`, {
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
  return fetchApi(`${base_url}/debtors?${queryString}`, {
    method: 'GET'
  }, {
    reject: 'Error al cargar los deudores'
  })
}

export const getDebtorById = async (debtorId: string) => {
  return fetchApi(`${base_url}/debtors/${debtorId}`, {
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

  return fetchApi(`${base_url}/debtors/${debtorId}`, fetchOptions, {
    promise: 'Actualizando deudor...',
    resolve: 'Deudor actualizado con éxito',
    reject: 'Error al actualizar el deudor'
  })
}

// Lookup service

export const countPendingDebtors = async () => {
  return fetchApi(`${base_url}/debtors/lookup/countPending`, {
    method: 'GET'
  })
}

export const countCorrectionDebtors = async ({ investorId }: { investorId: string }) => {
  return fetchApi(`${base_url}/debtors/lookup/countCorrection/${investorId}`, {
    method: 'GET'
  })
}
