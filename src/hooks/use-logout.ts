import Cookies from 'js-cookie'
import { useContext } from 'react'
import { useNavigate } from 'react-router'

import { AuthContext } from '@/contexts/auth.context'

export function useLogout () {
  const navigate = useNavigate()

  const authContext = useContext(AuthContext)
  if (!authContext) {
    throw new Error('useLogout must be used within AuthProvider')
  }
  const { setLoggedInUser } = authContext

  return () => {
    setLoggedInUser(null)
    Cookies.remove('logged-in-user')
    navigate('/login', {replace: true})
  }
}
