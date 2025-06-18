"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useClientAuth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.labels.includes("admin")) {
      router.push("/");
    }
  }, [user, router]);

  if (!user?.labels.includes("admin")) {
    return null;
  }

  return <>{children}</>;
}
