"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, Briefcase, Menu, User, UserPlus, Store } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { trpc } from "@/lib/trpc/client";
import { Skeleton } from "../ui/skeleton";
import clsx from "clsx";

const SEARCH_PLACEHOLDERS = [
  "Cleaner",
  "Electrician",
  "Painters",
  "Photographer",
  "Event Planner",
  "Pest Control",
  "IT Support",
  "Caterer",
];

const Header = () => {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [search, setSearch] = useState(params?.get("query") || "");
  const [location, setLocation] = useState(params?.get("location") || "");

  const { data: businesses, isLoading } = trpc.getBusinessesByUserId.useQuery(
    { userId: auth.user?.$id || "" },
    { enabled: auth.isAuthenticated && !!auth.user?.$id }
  );

  const sendEmailMutation = trpc.sendEmailVerification.useMutation();

  // Rolling placeholder state
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [fade, setFade] = useState(true);

  React.useEffect(() => {
    if (search) return;
    let fadeTimeout: NodeJS.Timeout;
    let idxTimeout: NodeJS.Timeout;

    fadeTimeout = setTimeout(() => setFade(false), 1700); // Start fade out
    idxTimeout = setTimeout(() => {
      setPlaceholderIdx((idx) => (idx + 1) % SEARCH_PLACEHOLDERS.length);
      setFade(true); // Fade in new text
    }, 2200);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(idxTimeout);
    };
  }, [placeholderIdx, search]);

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

  const sendEmail = async () => {
    if (sendEmailMutation.isPending || sendEmailMutation.isSuccess) return;
    try {
      await sendEmailMutation.mutateAsync();
      // Optional: Show success toast
    } catch (error) {
      console.error("Failed to send verification email:", error);
      // Optional: Show error toast
    }
  };

  if (!auth.isAuthenticated && pathname?.startsWith("/auth")) {
    return null;
  }

  return (
    <header className="bg-background sticky top-0 z-50 border-b">
      {auth.isAuthenticated && !auth.user.emailVerification && (
        <div className="bg-yellow-100 text-yellow-800 text-center py-2 text-sm">
          Your email is not verified. Please check your inbox for a verification
          link or{" "}
          <button className="underline" onClick={() => sendEmail()}>
            click here to resend the email
          </button>
          {sendEmailMutation.isPending ? " (sending...)" : ""}.
        </div>
      )}

      {/* {auth.isAuthenticated &&
        auth.user.prefs.subscriptionStatus !== "active" && (
          <div className="bg-yellow-100 text-yellow-800 text-center py-2 text-sm">
            You are not subscribed yet. Subscribe to activate {" "}
            <button className="underline" onClick={() => sendEmail()}>
              click here to subscribe
            </button>
            {sendEmailMutation.isPending ? " (sending...)" : ""}.
          </div>
        )} */}

      <nav className="mx-3 py-4 flex justify-between items-center gap-4">
        <Link href="/" className="w-1/4">
          <Image
            src="/images/logo.png"
            alt="CheckAroundMe Logo"
            width={150}
            height={50}
          />
        </Link>

        <div className="space-x-2 flex justify-center flex-grow w-2/4">
          <div className="flex items-center justify-center gap-2 w-full md:w-[40vw] lg:w-[40%]">
            <div className="flex items-center border border-gray-300 rounded-full flex-grow relative">
              <Input
                type="text"
                className="w-full md:w-2/5 px-4 py-2 focus:outline-none rounded-full md:rounded-none md:rounded-l-full md:border-r-0 bg-transparent relative z-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder=""
                autoComplete="off"
              />
              {/* Rolling placeholder overlay */}
              {!search && (
                <span
                  className={clsx(
                    "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-200",
                    "w-[90%] overflow-hidden h-[2em] flex items-center select-none pl-2 text-xs md:text-base",
                    fade
                      ? "opacity-100 transition-opacity duration-400"
                      : "opacity-0 transition-opacity duration-400"
                  )}
                  style={{ zIndex: 1 }}
                  aria-hidden="true"
                >
                  {SEARCH_PLACEHOLDERS[placeholderIdx]}
                </span>
              )}
              <div className="w-px h-6 bg-gray-300 hidden md:block"></div>
              <Input
                type="text"
                placeholder="Location..."
                className="w-3/5 px-4 py-2 focus:outline-none rounded-r-full hidden md:block md:rounded-none md:rounded-r-full md:border-l-0 text-base"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <Button
              size="icon"
              variant="default"
              className="rounded-full bg-primary hidden md:flex"
              onClick={handleSearch}
              aria-label="Search"
            >
              <Search />
            </Button>
          </div>

          {auth.isAuthenticated && (
            <NavigationMenu className="hidden md:block">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>For User</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    {isLoading ? (
                      <div className="flex items-center select-none space-x-2 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ) : businesses && businesses.length > 0 ? (
                      <Link
                        href={`/business/${businesses[0].$id}`} // Assuming the first business is the primary one
                        className="flex items-center select-none space-x-2 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="flex items-center">
                          <Store className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-primary" />
                          <span>My Business</span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-8">
                          {businesses[0].name}
                        </span>
                      </Link>
                    ) : (
                      <Link
                        href="/business/create"
                        className="flex items-center select-none space-x-2 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <Briefcase className="h-4 w-4" />
                        <span>Add a business</span>
                      </Link>
                    )}
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}
        </div>

        <div className="flex justify-end items-center w-1/5">
          {auth.isAuthenticated ? (
            <UserNav />
          ) : (
            <>
              <span className="items-center space-x-2 text-xs hidden md:flex">
                <Button variant="ghost">
                  <Link href="/auth">Sign in</Link>
                </Button>
                <span className="text-muted-foreground">/</span>
                <Button variant="ghost">
                  <Link href="/auth?signup">Register</Link>
                </Button>
              </span>

              {/* Mobile menu */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-2">
                    <Menu className="h-5 w-5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Link
                        href="/auth"
                        className="flex items-center select-none space-x-2 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Sign in</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href="/auth?signup"
                        className="flex items-center select-none space-x-2 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span>Register</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
