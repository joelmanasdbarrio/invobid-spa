import fetchApi from '@/lib/fetchApi'

// TODO: const base_url = import.meta.env.VITE_BASE_URL

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

export const getAdmins = async () => {
  return fetchApi('http://localhost:3000/api/v1/admins', {
    method: 'GET'
  }, {
    reject: 'Error al cargar los administradores'
  })
}

export const getAdminById = async (adminId: string) => {
  return fetchApi(`http://localhost:3000/api/v1/admins/${adminId}`, {
    method: 'GET'
  }, {
    reject: 'Error al cargar el administrador'
  })
}

export const updateAdminById = async (adminId: string, body: string) => {
  return fetchApi(`http://localhost:3000/api/v1/admins/${adminId}`, {
    method: 'PATCH',
    body,
    headers: { 'Content-Type': 'application/json'}
  }, {
    promise: 'Actualizando administrador...',
    resolve: 'Administrador actualizado con éxito',
    reject: 'Error al actualizar el administrador'
  })
}

export const deleteAdminById = async (adminId: string) => {
  return fetchApi(`http://localhost:3000/api/v1/admins/${adminId}`, {
    method: 'DELETE'
  }, {
    promise: 'Eliminando administrador...',
    resolve: 'Administrador eliminado con éxito',
    reject: 'Error al eliminar el administrador'
  })
}
