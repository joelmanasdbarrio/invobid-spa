import fetchApi from '@/lib/fetchApi'
import type { AccessTokenResponse, ResponseKO } from '@/types/Response'
import type { User } from '@/types/User'

const base_url = import.meta.env.VITE_BASE_URL

export const login = (body: string, onSuccess?: (response: AccessTokenResponse<User>) => void, onReject?: (error: ResponseKO) => void, activateAccount: boolean = false) => {
  return fetchApi<AccessTokenResponse<User>>(`${base_url}/auth/login`, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
      ...(activateAccount && { 'X-Activate-Account': 'true' })
    }
  }, {
    promise: 'Iniciando sesión...',
    resolve: 'Sesión iniciada con éxito',
    reject: 'Error al iniciar sesión'
  },
  onSuccess,
  onReject
  )
}
