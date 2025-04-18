"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, Briefcase, Menu, User, UserPlus } from "lucide-react";
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
        <Link href="/" className="">
          <Image
            src="/images/logo.png"
            alt="CheckAroundMe Logo"
            width={150}
            height={50}
          />
        </Link>

        <div className="flex justify-center items-center space-x-2 flex-grow">
          <div className="flex items-center justify-center gap-2 w-full md:w-[40vw] lg:w-[40%]">
            <div className="flex items-center border border-gray-300 rounded-full flex-grow">
              <Input
                type="text"
                placeholder="Search..."
                className="w-full md:w-2/5 px-4 py-2 focus:outline-none rounded-full md:rounded-none md:rounded-l-full md:border-r-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="w-px h-6 bg-gray-300 hidden md:block"></div>
              <Input
                type="text"
                placeholder="Location..."
                className="w-3/5 px-4 py-2 focus:outline-none rounded-r-full hidden md:block md:rounded-none md:rounded-r-full md:border-l-0"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <Button
              size="icon"
              variant="default"
              className="rounded-full bg-[#2E57A9] hidden md:flex"
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

        <div className="flex justify-end items-center">
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


/*

{Object.keys(availableHours).map((day) => (
            <div key={day} className="flex justify-between">
              <span>{day}</span>
              <div className="flex flex-row">
                <Checkbox
                  className="flex items-center "
                  defaultChecked={availableHours[day].closed}
                  onCheckedChange={(ev) =>
                    updateBusinessHours(day, "closed", ev.valueOf())
                  }
                />
                <Input
                  type="time"
                  defaultValue={availableHours[day].start}
                  onChange={(ev) =>
                    updateBusinessHours(day, "start", ev.target.value)
                  }
                  disabled={availableHours[day].closed}
                  name={day + "-start"}
                ></Input>{" "}
                -{" "}
                <Input
                  type="time"
                  defaultValue={availableHours[day].end}
                  onChange={(ev) =>
                    updateBusinessHours(day, "end", ev.target.value)
                  }
                  disabled={availableHours[day].closed}
                  name={day + "-end"}
                ></Input>
              </div>
            </div>
          ))}

         
  const updateBusinessHours = (
    day: string,
    type: "start" | "end" | "closed",
    value: string | boolean
  ) => {
    console.log(day, type, value);
    setAvailableHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value,
      },
    }));
  }; 

*/