import { AuthContext } from '@/contexts/auth.context'
import { type Admin, type Investor, UserType } from '@/types/User'
import { useContext } from 'react'
import AdminProfileForm from './admin-form'
import InvestorProfileForm from './investor-form'

export default function ProfilePage () {
  const authContext = useContext(AuthContext)
  if (!authContext) {
    throw new Error('AuthContext must be used within AuthProvider')
  }
  const { loggedInUser } = authContext

  return (
    <section className='flex flex-col gap-4'>
      <h3 className='text-lg'>Actualiza tus datos de usuario</h3>
      {loggedInUser && loggedInUser.type === UserType.INVESTOR && (
        <InvestorProfileForm user={loggedInUser as Investor} />
      )}
      {loggedInUser && loggedInUser.type === UserType.ADMIN && (
        <AdminProfileForm user={loggedInUser as Admin} />
      )}
    </section>
  )
}
