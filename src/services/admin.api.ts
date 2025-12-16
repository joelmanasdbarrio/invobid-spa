import fetchApi from '@/lib/fetchApi'

interface CreateAdminResponse {
  status: string
  data: {
    id: string
    email: string
    password: string
    name: string
    type: string
  }
  access_token: string
}

export const createAdmin = (body: string, onSuccess?: (response: CreateAdminResponse) => void, onReject?: (error: Error) => void) => {
  return fetchApi<CreateAdminResponse>('http://localhost:3000/api/v1/auth/register/admin', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json'}
  }, {
    promise: 'Creando cuenta...',
    resolve: 'Cuenta creada con éxito',
    reject: 'Error al crear la cuenta'
  },
  onSuccess,
  onReject
  )
}
