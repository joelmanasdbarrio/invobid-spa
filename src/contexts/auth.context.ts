import {createContext} from 'react'

export type AuthContextType = {
  loggedInUser: any
  setLoggedInUser: React.Dispatch<React.SetStateAction<any>>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
