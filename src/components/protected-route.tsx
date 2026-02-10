import { AuthContext } from '@/contexts/auth.context'
import { UserType, type Investor, type InvestorType } from '@/types/User'
import { useContext } from 'react'
import { Navigate } from 'react-router'
import { Spinner } from './ui/spinner'

export function ProtectedRoute ({ userType, children }: { userType: UserType | InvestorType | undefined, children: React.ReactNode }) {
  const authContext = useContext(AuthContext)
  if (!authContext) {
    throw new Error('ProtectedRoute must be used within AuthProvider')
  }
  const { loggedInUser, isLoading } = authContext

  if (isLoading) {
    return (
      <div className='w-full h-full flex items-center justify-center'>
        <Spinner className='size-8' />
      </div>
    )
  }

  if (!loggedInUser) {
    return <Navigate to='/login' replace />
  }

  if (userType && (userType !== loggedInUser.type && !(loggedInUser.type === UserType.INVESTOR && userType === (loggedInUser as Investor).investorType))) {
    return <Navigate to='/' replace />
  }

  return <>{children}</>
}
