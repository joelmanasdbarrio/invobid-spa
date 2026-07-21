import fetchApi from '@/lib/fetchApi'
import type { AccessTokenResponse, PaginatedResponse, ResponseKO, ResponseOK } from '@/types/Response'
import type { Admin } from '@/types/User'

const base_url = import.meta.env.VITE_BASE_URL

export const createAdmin = (body: string, onSuccess?: (response: AccessTokenResponse<Admin>) => void, onReject?: (error: ResponseKO) => void) => {
  return fetchApi<AccessTokenResponse<Admin>>(`${base_url}/auth/register/admin`, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' }
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
  return fetchApi<PaginatedResponse<Admin[]>>(`${base_url}/admins`, {
    method: 'GET'
  }, {
    reject: 'Error al cargar los administradores'
  })
}

export const getAdminById = async (adminId: string) => {
  return fetchApi<ResponseOK<Admin>>(`${base_url}/admins/${adminId}`, {
    method: 'GET'
  }, {
    reject: 'Error al cargar el administrador'
  })
}

export const updateAdminById = async (adminId: string, body: string) => {
  return fetchApi<ResponseOK<Admin>>(`${base_url}/admins/${adminId}`, {
    method: 'PATCH',
    body,
    headers: { 'Content-Type': 'application/json' }
  }, {
    promise: 'Actualizando administrador...',
    resolve: 'Administrador actualizado con éxito',
    reject: 'Error al actualizar el administrador'
  })
}

export const deleteAdminById = async (adminId: string) => {
  return fetchApi<ResponseOK<null>>(`${base_url}/admins/${adminId}`, {
    method: 'DELETE'
  }, {
    promise: 'Eliminando administrador...',
    resolve: 'Administrador eliminado con éxito',
    reject: 'Error al eliminar el administrador'
  })
}
