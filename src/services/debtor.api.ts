import fetchApi from '@/lib/fetchApi'

const base_url = import.meta.env.VITE_BASE_URL

export const getDebtors = async (queryParams?: Record<string, string>) => {
  const queryString = new URLSearchParams(queryParams).toString()
  return fetchApi(`${base_url}/debtors?${queryString}`, {
    method: 'GET'
  }, {
    reject: 'Error al cargar los deudores'
  })
}

// Lookup service

export const countPendingDebtors = async () => {
  return fetchApi(`${base_url}/debtors/lookup/countPending`, {
    method: 'GET'
  })
}
