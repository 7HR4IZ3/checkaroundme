"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../auth/provider";
import { usePathname } from "next/navigation";
import { UserNav } from "./user-nav";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Header = () => {
  const auth = useAuth();
  const pathname = usePathname();

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
            />
            <div className="w-px h-6 bg-gray-300"></div>
            <Input
              type="text"
              placeholder="Location..."
              className="w-3/5 px-4 py-2 focus:outline-none rounded-r-full"
            />
          </div>

          <Button size="icon" variant="default" className="rounded-full">
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
