import fetchApi from '@/lib/fetchApi'

interface LoginResponse {
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

export const login = (body: string, onSuccess?: (response: LoginResponse) => void, onReject?: (error: Error) => void) => {
  return fetchApi<LoginResponse>('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json'}
  }, {
    promise: 'Iniciando sesión...',
    resolve: 'Sesión iniciada con éxito',
    reject: 'Error al iniciar sesión'
  },
  onSuccess,
  onReject
  )
}
