"use client";

import { Suspense } from "react";
import { useAuth } from "@/lib/hooks/useClientAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/ui/loading";
import { redirect } from "next/navigation";

function ProfilePageInner() {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return redirect("/auth");
  }

  return (
    <div className="flex flex-col p-8 gap-6 bg-background">
      <div className="my-auto">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 space-y-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage
                  src={auth.profile.avatarUrl}
                  alt={auth.user.name || "User"}
                />
                <AvatarFallback>
                  {auth.user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">
                {auth.user.name || "User"}
              </h2>
              <p className="text-muted-foreground">{auth.user.email}</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-medium">Account Details</h3>
              <p className="text-sm text-muted-foreground">
                Member since{" "}
                {new Date(
                  auth.user.$createdAt || Date.now()
                ).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="w-full md:w-2/3 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Personal Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={auth.user.name || ""} readOnly />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={auth.user.email || ""} readOnly />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={auth.user.phone || ""} readOnly />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Account Actions</h2>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline">Change Password</Button>
                <Button variant="outline">Update Profile Picture</Button>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProfilePageInner />
    </Suspense>
  );
}
