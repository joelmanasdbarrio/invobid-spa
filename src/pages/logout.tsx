import { AuthContext } from '@/contexts/auth.context'
import Cookies from 'js-cookie'
import { use, useEffect } from 'react'
import { useNavigate } from 'react-router'

export default function Logout () {
  const navigate = useNavigate()

  const authContext = use(AuthContext)
  if (!authContext) {
    throw new Error('AuthContext must be used within AuthProvider')
  }
  const { setLoggedInUser } = authContext

  useEffect(() => {
    setLoggedInUser(null)
    Cookies.remove('logged-in-user')
    navigate('/login')
  }, [navigate, setLoggedInUser])

  return (
    <></>
  )
}
