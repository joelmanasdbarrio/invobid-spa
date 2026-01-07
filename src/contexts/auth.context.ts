import type { User } from '@/types/User'
import { createContext } from 'react'

export type AuthContextType = {
  loggedInUser: User | null
  setLoggedInUser: React.Dispatch<React.SetStateAction<User | null>>
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
