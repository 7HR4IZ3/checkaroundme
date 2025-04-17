import { createContext, useContext } from 'react';
import { User } from '../schema';
import type { Models } from 'appwrite';

interface AuthContextType {
  isAuthenticated: boolean;
  user: Models.User<Models.Preferences> | null,
  profile: User | null;
  login: any; logout: any
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  profile: null,
  login: null,
  logout: null
});

export const useAuth = () => useContext(AuthContext);