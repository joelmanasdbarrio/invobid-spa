import {useState} from 'react'
import Cookies from 'js-cookie'
import {AuthContext} from './auth.context'

export function AuthProvider ({children}: {children: React.ReactNode}) {
  const cookieValue = Cookies.get('logged-in-user')
  const [loggedInUser, setLoggedInUser] = useState(cookieValue ? JSON.parse(cookieValue) : null)

  return (
    <AuthContext.Provider value={{ loggedInUser, setLoggedInUser }}>
      {children}
    </AuthContext.Provider>
  )
}
