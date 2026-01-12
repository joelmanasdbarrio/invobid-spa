import {getAdminById} from '@/services/admin.api'
import {getInvestorById} from '@/services/investor.api'
import {UserType} from '@/types/User'
import Cookies from 'js-cookie'
import {useEffect, useState} from 'react'
import {toast} from 'sonner'
import {AuthContext} from './auth.context'

export function AuthProvider ({children}: {children: React.ReactNode}) {
  const userCookie = Cookies.get('logged-in-user')
  const [loggedInUser, setLoggedInUser] = useState(userCookie ? JSON.parse(userCookie) : null)
  const [loggedInUserId, setLoggedInUserId] = useState(userCookie ? JSON.parse(userCookie).id : null)
  const [isLoading, setIsLoading] = useState(!!loggedInUserId)

  useEffect(() => {
    setLoggedInUserId(loggedInUser ? loggedInUser.id : null)
  }, [loggedInUser])

  useEffect(() => {
    if(loggedInUserId) {
      setIsLoading(true)
      switch (loggedInUser?.type) {
        case UserType.ADMIN:
          getAdminById(loggedInUserId)
            .then((res) => {
              setLoggedInUser(res.data)
              setLoggedInUserId(res.data.id)
            })
            .catch(() => {
              toast.error('Error al obtener los datos del usuario. Por favor, inicia sesión de nuevo.')
              setLoggedInUser(null)
              Cookies.remove('logged-in-user')
            })
            .finally(() => {
              setIsLoading(false)
            })
          break
        case UserType.INVESTOR:
          getInvestorById(loggedInUserId)
            .then((res) => {
              setLoggedInUser(res.data)
              setLoggedInUserId(res.data.id)
            })
            .catch(() => {
              toast.error('Error al obtener los datos del usuario. Por favor, inicia sesión de nuevo.')
              setLoggedInUser(null)
              Cookies.remove('logged-in-user')
            })
            .finally(() => {
              setIsLoading(false)
            })
          break
        default:
          setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [loggedInUser?.type, loggedInUserId])

  return (
    <AuthContext.Provider value={{ loggedInUser, setLoggedInUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
