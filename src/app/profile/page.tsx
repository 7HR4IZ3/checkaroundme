"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/hooks/useClientAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/ui/loading";
import { redirect } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { updateUserSchema } from "@/lib/schema"; // For potential client-side validation
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserBusinesses } from "@/components/profile/user-businesses";
import { User, Settings, Briefcase } from "lucide-react";

// Extracted EditProfileForm component
function EditProfileForm() {
  const auth = useAuth();
  const [name, setName] = useState(
    auth.isAuthenticated ? auth.user.name || "" : ""
  );
  const [phone, setPhone] = useState(
    auth.isAuthenticated ? auth.user.phone || "" : ""
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    auth.isAuthenticated ? auth.profile.avatarUrl || null : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const updateUserMutation = trpc.updateUser.useMutation({
    onSuccess: (data) => {
      toast.success("Profile updated successfully!");
      utils.getUserById.invalidate({
        userId: auth.isAuthenticated ? auth.user.$id : "",
      });
      // Potentially update auth context if it's not automatically refreshed
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });

  const uploadAvatarMutation = trpc.uploadAvatar.useMutation({
    onSuccess: (avatarUrl) => {
      toast.success("Avatar updated successfully!");
      if (auth.isAuthenticated && avatarUrl) {
        setAvatarPreview(avatarUrl);
        utils.getUserById.invalidate({ userId: auth.user.$id });
        // Potentially update auth context
      }
      setAvatarFile(null);
    },
    onError: (error) => {
      toast.error(`Failed to upload avatar: ${error.message}`);
    },
  });

  useEffect(() => {
    if (auth.isAuthenticated) {
      setName(auth.user.name || "");
      setPhone(auth.user.phone || "");
      setAvatarPreview(auth.profile.avatarUrl || null);
    }
  }, [auth.isAuthenticated, auth.user, auth.profile]);

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth.isAuthenticated) return;
    try {
      updateUserSchema.partial().parse({ fullName: name, phone });
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => toast.error(err.message));
        return;
      }
      toast.error("Invalid data.");
      return;
    }
    updateUserMutation.mutate({
      userId: auth.user.$id,
      data: { fullName: name, phone },
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !auth.isAuthenticated) {
      toast.info("Please select an image file first.");
      return;
    }
    uploadAvatarMutation.mutate({ file: avatarFile, userId: auth.user.$id });
  };

  if (!auth.isAuthenticated) {
    // This case should ideally be handled by ProfilePageInner redirect
    return <p>Please log in to edit your profile.</p>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 pt-6">
      <div className="w-full md:w-1/3 space-y-6">
        <div className="flex flex-col items-center">
          <Avatar className="h-32 w-32 mb-4 relative group">
            <AvatarImage
              src={avatarPreview || auth.profile.avatarUrl}
              alt={name || "User"}
            />
            <AvatarFallback>
              {(name || auth.user.name)?.charAt(0) || "U"}
            </AvatarFallback>
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => fileInputRef.current?.click()}
            >
              Edit
            </Button>
          </Avatar>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
          {avatarFile && (
            <Button
              onClick={handleAvatarUpload}
              disabled={uploadAvatarMutation.isPending}
              size="sm"
              className="mt-2"
            >
              {uploadAvatarMutation.isPending
                ? "Uploading..."
                : "Upload New Avatar"}
            </Button>
          )}
        </div>
      </div>
      <div className="w-full md:w-2/3 space-y-6">
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={updateUserMutation.isPending}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email (cannot be changed)</Label>
              <Input
                id="edit-email"
                value={auth.user.email || ""}
                readOnly
                disabled
                className="cursor-not-allowed bg-muted/50"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., +1234567890"
                disabled={updateUserMutation.isPending}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={
              updateUserMutation.isPending ||
              (name === (auth.user.name || "") &&
                phone === (auth.user.phone || ""))
            }
          >
            {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
        <Separator />
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Account Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" disabled>
              Change Password (soon)
            </Button>
            <Button variant="destructive" disabled>
              Delete Account (soon)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Extracted ViewProfileDetails component
function ViewProfileDetails() {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    // This case should ideally be handled by ProfilePageInner redirect
    return <p>Please log in to view your profile.</p>;
  }

  // const { data: userProfile, isLoading: isLoadingProfile } =
  //   trpc.getUserById.useQuery(
  //     { userId: auth.user.$id },
  //     { enabled: auth.isAuthenticated }
  //   );

  const profileToDisplay = auth.profile; // Fallback to auth context profile if query is loading/failed initially
  const appwriteUser = auth.user;

  if (!profileToDisplay) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 pt-6">
      <div className="w-full md:w-1/3 space-y-6">
        <div className="flex flex-col items-center">
          <Avatar className="h-32 w-32 mb-4">
            <AvatarImage
              src={profileToDisplay?.avatarUrl || ""}
              alt={profileToDisplay?.fullName || appwriteUser.name || "User"}
            />
            <AvatarFallback>
              {(profileToDisplay?.fullName || appwriteUser.name)?.charAt(0) ||
                "U"}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold">
            {profileToDisplay?.fullName || appwriteUser.name || "User"}
          </h2>
          <p className="text-muted-foreground">{appwriteUser.email}</p>
        </div>
        <Separator />
        <div className="space-y-2">
          <h3 className="font-medium">Account Details</h3>
          <p className="text-sm text-muted-foreground">
            Member since{" "}
            {new Date(
              appwriteUser.$createdAt || Date.now()
            ).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="w-full md:w-2/3 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="view-name">Full Name</Label>
              <Input
                id="view-name"
                value={profileToDisplay?.fullName || appwriteUser.name || ""}
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="view-email">Email</Label>
              <Input
                id="view-email"
                value={appwriteUser.email || ""}
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="view-phone">Phone</Label>
              <Input
                id="view-phone"
                value={profileToDisplay?.phone || appwriteUser.phone || ""}
                readOnly
              />
            </div>
          </div>
        </div>
        <Separator />
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Account Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" disabled>
              Change Password (soon)
            </Button>
            <Button variant="destructive" disabled>
              Delete Account (soon)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfilePageInner() {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return redirect("/auth");
  }

  return (
    <div className="flex flex-col p-4 md:p-8 gap-6 bg-background min-h-[70vh]">
      <div className="max-w-5xl w-full mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        <Tabs defaultValue="view-profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:max-w-md">
            <TabsTrigger value="view-profile">
              <User className="mr-2 h-4 w-4" /> View Profile
            </TabsTrigger>
            <TabsTrigger value="edit-profile">
              <Settings className="mr-2 h-4 w-4" /> Edit Profile
            </TabsTrigger>
            <TabsTrigger value="my-businesses">
              <Briefcase className="mr-2 h-4 w-4" /> My Businesses
            </TabsTrigger>
          </TabsList>
          <TabsContent value="view-profile">
            <ViewProfileDetails />
          </TabsContent>
          <TabsContent value="edit-profile">
            <EditProfileForm />
          </TabsContent>
          <TabsContent value="my-businesses">
            <UserBusinesses />
          </TabsContent>
        </Tabs>
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
