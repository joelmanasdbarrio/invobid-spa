import { AuthContext } from '@/contexts/auth.context'
import { useContext } from 'react'

export default function useLoggedInUser () {
  const authContext = useContext(AuthContext)
  if (!authContext) {
    throw new Error('AuthContext must be used within AuthProvider')
  }
  const { loggedInUser } = authContext

  return loggedInUser
}
