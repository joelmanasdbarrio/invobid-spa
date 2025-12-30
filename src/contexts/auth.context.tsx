import {useEffect, useState} from 'react'
import Cookies from 'js-cookie'
import {AuthContext} from './auth.context'
import {useNavigate} from 'react-router'
import {toast} from 'sonner'

export function AuthProvider ({children}: {children: React.ReactNode}) {
  const cookieValue = Cookies.get('logged-in-user')
  const [loggedInUser, setLoggedInUser] = useState(cookieValue ? JSON.parse(cookieValue) : null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!loggedInUser) {
      toast.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.')
      navigate('/login')
    }
  }, [loggedInUser, navigate])

  return (
    <AuthContext.Provider value={{ loggedInUser, setLoggedInUser }}>
      {children}
    </AuthContext.Provider>
  )
}
