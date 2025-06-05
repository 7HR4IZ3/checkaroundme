"use client";

import { ReactNode, useEffect, useMemo } from "react";

import { AuthContext } from "@/lib/hooks/useClientAuth";
import { trpc } from "@/lib/trpc/client";
import Loading from "../ui/loading";
import { usePathname, useRouter } from "next/navigation";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const utils = trpc.useUtils();
  const router = useRouter();
  const pathname = usePathname();
  const { data: currentUser, isLoading: loadingCurrentUser } =
    trpc.getCurrentUserWithProfile.useQuery();

  const [auth, isAuthenticated] = useMemo(() => {
    if (currentUser) {
      return [currentUser, true];
    } else {
      return [null, false];
    }
  }, [loadingCurrentUser]);

  // useEffect(() => {
  //   // If user is authenticated, 2FA is enabled, but not verified, redirect to OTP page
  //   if (
  //     isAuthenticated &&
  //     !auth?.user.emailVerification &&
  //     pathname !== "/auth/verify-otp"
  //   ) {
  //     router.replace("/auth/verify-otp");
  //   }
  // }, [isAuthenticated, auth, pathname, router]);

  // const signInMutation = trpc.login.useMutation();
  const signoutMutation = trpc.logout.useMutation();

  if (loadingCurrentUser) return <Loading />;

  // const login = async (
  //   method: "email" | "google",
  //   data: { email: string; password: string }
  // ) => {
  //   console.log(data);
  //   try {
  //     if (method === "google") {
  //     } else {
  //       const result = await signInMutation.mutateAsync(data);
  //       if (result.success) {
  //         window.location.assign("/");
  //         window.location.reload();
  //       } else {
  //         // ... error handling
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Login error:", error);
  //     throw error;
  //   }
  // };

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

  const refresh = () => {
    utils.getCurrentUser.refetch();
  };

  return (
    <AuthContext.Provider
      // @ts-ignore
      value={{
        logout,
        refresh,
        user: auth?.user ?? null,
        profile: auth?.profile ?? null,
        isLoading: loadingCurrentUser,
        isAuthenticated: isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
