import fetchApi from '@/lib/fetchApi'

export const createInvestor = (body: string, onSuccess?: () => void, onReject?: () => void) => {
  return fetchApi('http://localhost:3000/api/v1/auth/register/investor', {
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
