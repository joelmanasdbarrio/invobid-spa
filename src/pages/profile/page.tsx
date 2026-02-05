import useLoggedInUser from '@/hooks/use-loggedInUser'
import { type Admin, type Investor, UserType } from '@/types/User'
import AdminProfileForm from './admin-form'
import InvestorProfileForm from './investor-form'

export default function ProfilePage () {
  const loggedInUser = useLoggedInUser()

  return (
    <section className='grid md:grid-cols-[1fr_200px] gap-4'>
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
