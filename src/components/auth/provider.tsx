"use client";

import { useState, ReactNode, useEffect, useMemo } from "react";

import { AuthContext } from "@/lib/hooks/useAuth";
import { trpc } from "@/lib/trpc/client";
import { User } from "@/lib/schema";
import { redirect, useRouter } from "next/navigation";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: currentUser, isLoading: loadingCurrentUser } =
    trpc.getCurrentUser.useQuery();

  const [user, isAuthenticated] = useMemo(() => {
    if (currentUser) {
      return [currentUser, true];
    } else {
      return [null, false];
    }
  }, [loadingCurrentUser]);

  const signInMutation = trpc.login.useMutation();
  const signoutMutation = trpc.logout.useMutation();

  const login = async (
    method: "email" | "google",
    data: { email: string; password: string }
  ) => {
    console.log(data);
    try {
      if (method === "google") {
      } else {
        const result = await signInMutation.mutateAsync(data);
        if (result.success) {
          window.location.assign("/");
          window.location.reload();
        } else {
          // ... error handling
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signoutMutation.mutateAsync();
      window.location.assign("/auth");
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
