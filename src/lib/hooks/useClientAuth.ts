import { createContext, useContext } from 'react';
import { User } from '../schema';
import type { Models } from 'appwrite';

type Authenticated = {
  isAuthenticated: true;
  user: Models.User<Models.Preferences>,
  profile: User;
}
type UnAuthenticated = {
  isAuthenticated: false;
  user: null,
  profile: null;
}


type AuthContextType = {
  login: any; logout: any;
  isLoading: boolean
} & (Authenticated | UnAuthenticated)

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  profile: null,
  login: null,
  logout: null,
  isLoading: true
});

export const useAuth = () => useContext(AuthContext);