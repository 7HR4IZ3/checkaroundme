import { createContext, useContext } from 'react';
import { createSessionClient } from '../appwrite/session';
import { User } from '../schema';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: any; logout: any
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: null,
  logout: null
});

export const useAuth = () => useContext(AuthContext);