import { AuthContext } from '@/contexts/auth.context'
import { useContext } from 'react'

export default function useAccessToken () {
  const authContext = useContext(AuthContext)
  if (!authContext) {
    throw new Error('AuthContext must be used within AuthProvider')
  }
  const { accessToken } = authContext

  return accessToken
}
