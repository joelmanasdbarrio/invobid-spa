import { AuthContext } from '@/contexts/auth.context'
import { use } from 'react'

export default function useLoggedInUser () {
  const authContext = use(AuthContext)
  if (!authContext) {
    throw new Error('AuthContext must be used within AuthProvider')
  }
  const { loggedInUser } = authContext

  return loggedInUser
}
