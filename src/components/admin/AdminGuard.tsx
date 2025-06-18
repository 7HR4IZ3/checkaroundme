"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useClientAuth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (
      !pathname?.startsWith("/admin/submissions") &&
      !user?.labels.includes("admin")
    ) {
      router.push("/");
    }
  }, [user, router]);

  if (
    !pathname?.startsWith("/admin/submissions") &&
    !user?.labels.includes("admin")
  ) {
    return null;
  }

  return <>{children}</>;
}
