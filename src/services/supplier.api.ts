import fetchApi from '@/lib/fetchApi'

export const createSupplier = (body) => {
  return fetchApi('http://localhost:3000/api/v1/suppliers', {
    method: 'POST',
    body
  }, {
    promise: 'Creando cuenta...',
    resolve: 'Cuenta creada con éxito',
    reject: 'Error al crear la cuenta'
  })
}
