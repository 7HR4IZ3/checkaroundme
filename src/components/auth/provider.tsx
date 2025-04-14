"use client";

import { useState, ReactNode, useEffect, useMemo } from "react";

import { AuthContext } from "@/lib/hooks/useAuth";
import { trpc } from "@/lib/trpc/client";
import { User } from "@/lib/schema";
import { useRouter } from "next/navigation";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { data: currentUser, isLoading: loadingCurrentUser } = trpc.getCurrentUser.useQuery();

  const [user, isAuthenticated] = useMemo(() => {
    if (currentUser) {
      return [currentUser, true]
    } else {
      return [null, false];
    }
  }, [loadingCurrentUser])

  const signInMutation = trpc.login.useMutation();

  const login = async (
    method: "email" | "google",
    data: { email: string; password: string }
  ) => {
    const router = useRouter();

    try {
      if (method === "google") {
      } else {
        signInMutation.mutate(
          data, {
            onSuccess: (result) => {
              if (result.success) {
                console.log("Sign-in successful:", result);
                console.log("Cookies after sign-in:", document.cookie);
                if (document.cookie.includes('cham_appwrite_session')) {
                  console.log("Session cookie found in browser");
                } else {
                  console.log("Session cookie not found in browser");
                }
                router.push("/");
              } else {
                // ... error handling
              }
            },
            onError: (error) => {
              // ... error handling
            },
          },
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
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
