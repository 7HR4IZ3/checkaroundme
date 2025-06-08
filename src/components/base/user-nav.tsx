// components/user-nav.tsx
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, MessageSquare, Store, User, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/hooks/useClientAuth";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

import { SignOutModal } from "@/components/ui/sign-out-modal";
import { useState } from "react";
import { Skeleton } from "../ui/skeleton";

export function UserNav() {
  const auth = useAuth();
  const router = useRouter();
  const [showSignOut, setShowSignOut] = useState(false);

  const { data: businesses, isLoading } = trpc.getBusinessesByUserId.useQuery(
    { userId: auth.user?.$id || "" },
    { enabled: auth.isAuthenticated && !!auth.user?.$id },
  );

  if (!auth.profile || !auth.user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 flex items-center p-1 rounded-full"
          >
            <Avatar className="h-8 w-8">
              {" "}
              {/* Added border like in design */}
              <AvatarImage
                src={auth.profile.avatarUrl}
                alt={auth.user.name.split(" ")[0]}
              />
              <AvatarFallback>
                {auth.user.name.split(" ")[0].charAt(0)}
              </AvatarFallback>
            </Avatar>
            {/* <span className="text-base font-medium hidden md:block">
              {auth.user.name.split(" ")[0]}
            </span> */}
            {/* ChevronDown indicates dropdown possibility */}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        {/* The Dropdown Content */}
        <DropdownMenuContent className="w-60 p-2" align="end" forceMount>
          {/* Profile Section */}
          <div className="flex items-center space-x-3 p-2 mb-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={auth.profile.avatarUrl} alt={auth.user.name} />
              <AvatarFallback>
                {auth.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold leading-none">
                {auth.user.name}
              </p>
              {/* Use Next.js Link for navigation */}
              <Link href="/profile" passHref legacyBehavior>
                <a className="text-xs text-muted-foreground underline hover:text-primary focus:outline-none focus:ring-1 focus:ring-ring rounded-sm">
                  View your profile
                </a>
              </Link>
            </div>
          </div>

          {/* Optional Separator */}
          {/* <DropdownMenuSeparator /> */}

          {/* Action Items */}
          {isLoading ? (
            <DropdownMenuItem className="text-base py-2 flex-col items-start">
              <div className="flex items-center">
                <Skeleton className="mr-3 h-5 w-5" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-3 w-16 ml-8" />
            </DropdownMenuItem>
          ) : businesses && businesses.length > 0 ? (
            <DropdownMenuItem
              className="text-base py-2 cursor-pointer group flex-col items-start"
              onClick={() => router.push(`/business/${businesses[0].$id}`)} // Assuming the first business is the primary one
            >
              <div className="flex items-center">
                <Store className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-primary" />
                <span>My Business</span>
              </div>
              <span className="text-xs text-muted-foreground ml-8">
                {businesses[0].name}
              </span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-base py-2 cursor-pointer group"
              onClick={() => router.push("/business/create")}
            >
              <Store className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-primary" />
              <span>Add a Business</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="text-base py-2 cursor-pointer group bg-gray-100 dark:bg-muted"
            onClick={() => router.push("/messages")}
          >
            <MessageSquare className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-primary" />
            <span>Messages</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-base py-2 cursor-pointer group"
            onClick={() => setShowSignOut(true)}
          >
            <LogOut className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-primary" />
            <span>Sign out</span>
            {/* Add logout logic via onClick if needed */}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SignOutModal
        open={showSignOut}
        onClose={() => {
          setShowSignOut(false);
          auth.logout();
        }}
        onConfirm={() => {
          setShowSignOut(false);
          auth.logout();
        }}
      />
    </>
  );
}
