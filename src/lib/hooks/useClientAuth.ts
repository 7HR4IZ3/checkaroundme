"use client";

import { createContext, useContext } from "react";
import { User } from "../schema";
import type { Models } from "appwrite";

type Authenticated = {
  isAuthenticated: true;
  user: Models.User<Models.Preferences>;
  profile: User;
};
type UnAuthenticated = {
  isAuthenticated: false;
  user: null;
  profile: null;
};

type AuthContextType = {
  refresh: () => void
  logout: any;
  isLoading: boolean;
} & (Authenticated | UnAuthenticated);

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  profile: null,
  logout: null,
  isLoading: true,
  refresh: () => null
});

export const useAuth = () => useContext(AuthContext);
