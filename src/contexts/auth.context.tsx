import { getAdminById } from '@/services/admin.api'
import { getInvestorById } from '@/services/investor.api'
import { UserType, type User } from '@/types/User'
import Cookies from 'js-cookie'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AuthContext } from './auth.context'

export function AuthProvider ({ children }: {children: React.ReactNode}) {
  const [authState, setAuthState] = useState({ loggedInUser: undefined as User | null | undefined, isLoading: true })
  const { loggedInUser, isLoading } = authState
  const setLoggedInUser = (user: User | null | ((prev: User | null) => User | null)) => {
    setAuthState(prev => ({
      ...prev,
      loggedInUser: typeof user === 'function' ? user(prev.loggedInUser ?? null) : user
    }))
  }

  useEffect(() => {
    const cookie = Cookies.get('logged-in-user')
    const parsedUserCookie = cookie ? JSON.parse(cookie) : null

    if (!parsedUserCookie?.id || !parsedUserCookie?.type) {
      setAuthState({ loggedInUser: null, isLoading: false })
      return
    }

    let isCancelled = false

    setAuthState(prev => ({ ...prev, isLoading: true }))
    switch (parsedUserCookie.type) {
      case UserType.ADMIN:
        getAdminById(parsedUserCookie.id)
          .then((res) => {
            if (!isCancelled) {
              setAuthState(prev => ({ ...prev, loggedInUser: res.data }))
            }
          })
          .catch(() => {
            if (!isCancelled) {
              toast.error('Error al obtener los datos del usuario. Por favor, inicia sesión de nuevo.')
              setAuthState(prev => ({ ...prev, loggedInUser: null }))
              Cookies.remove('logged-in-user')
            }
          })
          .finally(() => {
            if (!isCancelled) {
              setAuthState(prev => ({ ...prev, isLoading: false }))
            }
          })
        break
      case UserType.INVESTOR:
        getInvestorById(parsedUserCookie.id)
          .then((res) => {
            if (!isCancelled) {
              setAuthState(prev => ({ ...prev, loggedInUser: res.data }))
            }
          })
          .catch(() => {
            if (!isCancelled) {
              toast.error('Error al obtener los datos del usuario. Por favor, inicia sesión de nuevo.')
              setAuthState(prev => ({ ...prev, loggedInUser: null }))
              Cookies.remove('logged-in-user')
            }
          })
          .finally(() => {
            if (!isCancelled) {
              setAuthState(prev => ({ ...prev, isLoading: false }))
            }
          })
        break
      default:
        setAuthState(prev => ({ ...prev, isLoading: false }))
    }

    return () => {
      isCancelled = true
    }
  }, [])

  const contextValue = useMemo(
    () => ({ loggedInUser, setLoggedInUser, isLoading }),
    [loggedInUser, isLoading]
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
