import fetchApi from '@/lib/fetchApi'

interface CreateInvestorResponse {
  status: string
  data: {
    id: string,
    email: string,
    name: string,
    type: string,
    phoneNumber: number,
    companyName: string,
    investorType: string,
    status: string,
    isOptedInNotificationsEmail: boolean,
    isOptedInNotificationsSMS: boolean
  }
  access_token: string
}

const base_url = import.meta.env.VITE_BASE_URL

export const createInvestor = (body: FormData, onSuccess?: (response: CreateInvestorResponse) => void, onReject?: (error: Error) => void) => {
  return fetchApi<CreateInvestorResponse>(`${base_url}/auth/register/investor`, {
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
  return fetchApi(`${base_url}/investors?${queryString}`, {
    method: 'GET'
  }, {
    reject: 'Error al cargar los inversores'
  })
}

export const getInvestorById = async (investorId: string) => {
  return fetchApi(`${base_url}/investors/${investorId}`, {
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

  return fetchApi(`${base_url}/investors/${investorId}`, fetchOptions, {
    promise: 'Actualizando inversor...',
    resolve: 'Inversor actualizado con éxito',
    reject: 'Error al actualizar el inversor'
  })
}

export const deleteInvestorById = async (investorId: string) => {
  return fetchApi(`${base_url}/investors/${investorId}`, {
    method: 'DELETE'
  }, {
    promise: 'Eliminando inversor...',
    resolve: 'Inversor eliminado con éxito',
    reject: 'Error al eliminar el inversor'
  })
}

// Lookup service

export const countPendingInvestors = async () => {
  return fetchApi(`${base_url}/investors/lookup/countPending`, {
    method: 'GET'
  })
}
