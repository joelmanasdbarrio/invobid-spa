import fetchApi from '@/lib/fetchApi'

export const createAdmin = (body: string, onSuccess?: () => void, onReject?: () => void) => {
  return fetchApi('http://localhost:3000/api/v1/auth/register/admin', {
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
