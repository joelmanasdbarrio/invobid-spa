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

export const createInvestor = (body: FormData, onSuccess?: (response: CreateInvestorResponse) => void, onReject?: (error: Error) => void) => {
  return fetchApi<CreateInvestorResponse>('http://localhost:3000/api/v1/auth/register/investor', {
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

export const getInvestors = async (queryParams?: Record<string, any>) => {
  const queryString = new URLSearchParams(queryParams).toString()
  return fetchApi(`http://localhost:3000/api/v1/investors?${queryString}`, {
    method: 'GET'
  }, {
    reject: 'Error al cargar los inversores'
  })
}

// Lookup service

export const countPendingInvestors = async () => {
  return fetchApi('http://localhost:3000/api/v1/investors/lookup/countPending', {
    method: 'GET'
  })
}
