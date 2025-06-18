"use client";

import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  ScrollText,
  Package,
} from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useClientAuth";

export function Sidebar() {
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname?.startsWith("/admin/submissions") && !auth.user) {
      redirect("/auth");
    }

    if (
      !pathname?.startsWith("/admin/submissions") &&
      !auth.user?.labels.includes("admin")
    ) {
      redirect("/");
    }
  }, [auth.user, router]);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Subscriptions", href: "/admin/subscriptions", icon: ScrollText },
    { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Plans", href: "/admin/plans", icon: Package },
  ];

  return !pathname?.startsWith("/admin/submissions") ? (
    <nav className="w-64 bg-white border-r px-3 py-6 flex flex-col h-screen">
      <div className="px-3 mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
      </div>
      <div className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  ) : null;
}
