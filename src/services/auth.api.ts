import fetchApi from '@/lib/fetchApi'

export const login = (body: string, onSuccess?: () => void, onReject?: () => void) => {
  return fetchApi('http://localhost:3000/api/v1/auth/login', {
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
