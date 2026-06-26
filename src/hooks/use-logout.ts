import Cookies from 'js-cookie'
import { useNavigate } from 'react-router'
import useLoggedInUser from '@/hooks/use-loggedInUser.ts'

export function useLogout () {
  const navigate = useNavigate()

  const { setLoggedInUser } = useLoggedInUser()

  return () => {
    setLoggedInUser(null)
    Cookies.remove('logged-in-user')
    navigate('/login', { replace: true })
  }
}
