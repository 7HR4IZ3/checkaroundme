"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";

import { useRouter } from "next/navigation";
import React, { useState, useCallback } from "react";

const Header = () => {
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  // Handler to perform search
  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("query", search.trim());
    if (location.trim()) params.set("location", location.trim());
    // Always reset to first page on new search
    params.set("offset", "0");
    router.push(`/listings?${params.toString()}`);
  }, [router, search, location]);

  // Allow Enter key to trigger search from either input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (!auth.isAuthenticated && pathname == "/auth") {
    return null;
  }

  return (
    <header className="bg-background sticky top-0 z-50 border-b">
      <nav className="mx-4 px-2 sm:px-6 lg:px-4 py-4 flex justify-between items-center gap-4">
        <Link href="/">
          <Image
            src="/images/logo.png"
            alt="CheckAroundMe Logo"
            width={150}
            height={50}
          />
        </Link>

        <div className="flex justify-between items-center space-x-2">
          <div className="flex items-center border border-gray-300 rounded-full w-2/3">
            <Input
              type="text"
              placeholder="Search..."
              className="w-2/5 px-4 py-2 focus:outline-none rounded-l-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="w-px h-6 bg-gray-300"></div>
            <Input
              type="text"
              placeholder="Location..."
              className="w-3/5 px-4 py-2 focus:outline-none rounded-r-full"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <Button
            size="icon"
            variant="default"
            className="rounded-full bg-[#2E57A9]"
            onClick={handleSearch}
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>For Business</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <Link
                    href="/for-business/register"
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    Switch to user
                  </Link>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {auth.isAuthenticated ? (
          <UserNav />
        ) : (
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/auth">Sign in</Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <Button variant="ghost" asChild>
              <Link href="/auth?signup">Register</Link>
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
