import fetchApi from '@/lib/fetchApi'
import type { BankAccount } from '@/types/BankAccount'
import type { ResponseOK } from '@/types/Response'

const base_url = import.meta.env.VITE_BASE_URL

export const updateBankAccountById = (body: FormData | string) => {
  const fetchOptions: RequestInit = {
    method: 'PATCH'
  }

  if (body instanceof FormData) {
    fetchOptions.body = body
  } else {
    fetchOptions.body = body
    fetchOptions.headers = { 'Content-Type': 'application/json' }
  }

  return fetchApi<ResponseOK<BankAccount>>(`${base_url}/bank-accounts`, fetchOptions, {
    promise: 'Actualizando cuenta bancaria...',
    resolve: 'Cuenta bancaria actualizada con éxito',
    reject: 'Error al actualizar la cuenta bancaria'
  })
}
//
