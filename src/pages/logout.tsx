import Cookies from 'js-cookie'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import useLoggedInUser from '@/hooks/use-loggedInUser.ts'

export default function Logout () {
  const navigate = useNavigate()

  const { setLoggedInUser } = useLoggedInUser()

  useEffect(() => {
    setLoggedInUser(null)
    Cookies.remove('logged-in-user')
    navigate('/login')
  }, [navigate, setLoggedInUser])

  return (
    <></>
  )
}
