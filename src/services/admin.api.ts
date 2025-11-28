import fetchApi from '@/lib/fetchApi'

export const createAdmin = (body) => {
  return fetchApi('http://localhost:3000/api/v1/admins', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json'}
  }, {
    promise: 'Creando cuenta...',
    resolve: 'Cuenta creada con éxito',
    reject: 'Error al crear la cuenta'
  })
}
