import type { User } from '@/types/User'
import { createContext } from 'react'

export type AuthContextType = {
  loggedInUser?: User
  setLoggedInUser: React.Dispatch<React.SetStateAction<User | null>>
  isLoading: boolean
  accessToken?: string
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
