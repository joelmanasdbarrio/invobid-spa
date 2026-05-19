import useLoggedInUser from '@/hooks/use-loggedInUser'
import { type Admin, type Investor, UserType } from '@/types/User'
import { LandmarkIcon, UserRoundPenIcon } from 'lucide-react'
import AdminProfileForm from './components/admin-form'
import BankAccountForm from './components/bank-account-form'
import InvestorProfileForm from './components/investor-form'

export default function ProfilePage () {
  const loggedInUser = useLoggedInUser()

  return (
    <>
      <section className='flex flex-col gap-4'>
        <div className='flex items-center gap-2'>
          <span className='rounded-lg p-1 bg-primary/20 text-primary'>
            <UserRoundPenIcon className='size-6' />
          </span>
          <h2 id='user-profile'>Actualiza tus datos de usuario</h2>
        </div>
        {loggedInUser && loggedInUser.type === UserType.INVESTOR && (
          <InvestorProfileForm user={loggedInUser as Investor} />
        )}
        {loggedInUser && loggedInUser.type === UserType.ADMIN && (
          <AdminProfileForm user={loggedInUser as Admin} />
        )}
      </section>
      {loggedInUser && loggedInUser.type === UserType.INVESTOR && (
        <section className='flex flex-col gap-4'>
          <div className='flex items-center gap-2'>
            <span className='rounded-lg p-1 bg-primary/20 text-primary'>
              <LandmarkIcon className='size-6' />
            </span>
            <h2 id='bank-account'>Actualiza tus datos bancarios</h2>
          </div>
          <BankAccountForm user={loggedInUser as Investor} />
        </section>
      )}
    </>
  )
}
