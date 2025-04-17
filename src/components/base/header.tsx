"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, Briefcase } from "lucide-react";
import { useAuth } from "@/lib/hooks/useClientAuth";
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
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [search, setSearch] = useState(params.get("query") || "");
  const [location, setLocation] = useState(params.get("location") || "");

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
        <Link href="/" className="w-1/4">
          <Image
            src="/images/logo.png"
            alt="CheckAroundMe Logo"
            width={150}
            height={50}
          />
        </Link>

        <div className="flex justify-between items-center space-x-2 w-2/4">
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-300 rounded-full">
              <Input
                type="text"
                placeholder="Search..."
                className="w-2/5 px-4 py-2 focus:outline-none rounded-l-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="w-px h-6 bg-gray-300 hidden md:block"></div>
              <Input
                type="text"
                placeholder="Location..."
                className="w-3/5 px-4 py-2 focus:outline-none rounded-r-full hidden md:block"
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
          </div>

          {auth.isAuthenticated && (
            <NavigationMenu className="hidden md:block">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>For User</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <Link
                      href="/business/create"
                      className="flex items-center select-none space-x-2 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-[10vw]"
                    >
                      <Briefcase className="h-4 w-4" />
                      <span>Add a business</span>
                    </Link>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}
        </div>

        {auth.isAuthenticated ? (
          <UserNav />
        ) : (
          <div className="flex items-center space-x-1 sm:space-x-2 w-1/4">
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
