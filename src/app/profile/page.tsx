"use client";

import { Suspense, useState, useEffect, useRef, JSX } from "react";
import { useAuth } from "@/lib/hooks/useClientAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/ui/loading";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import {
  updateUserSchema,
  userSettingsSchema,
  UserSettings,
  changePasswordSchema,
  ChangePasswordInput,
} from "@/lib/schema";
import { z } from "zod";
import { UserBusinesses } from "@/components/profile/user-businesses";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Settings,
  Briefcase,
  ShieldCheck,
  CreditCard,
  ListChecks,
  Share2,
  Copy,
  Edit3,
  LogOut,
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Helper to format currency
const formatCurrency = (amount: number, currencyCode = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currencyCode,
  }).format(amount / 100);

// Section: Profile Overview
function ProfileOverviewSection() {
  const auth = useAuth();
  if (!auth.isAuthenticated || !auth.user) return <Loading />;

  const profileToDisplay = auth.profile;
  const appwriteUser = auth.user;

  return (
    <Card className="rounded-lg border shadow-sm">
      <CardHeader>
        <CardTitle>Profile Overview</CardTitle>
        <CardDescription>
          A summary of your profile information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
            <AvatarImage
              src={
                profileToDisplay?.avatarUrl ||
                appwriteUser.prefs?.avatarUrl ||
                ""
              }
              alt={profileToDisplay?.fullName || appwriteUser.name || "User"}
            />
            <AvatarFallback>
              {(profileToDisplay?.fullName || appwriteUser.name)
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-semibold">
              {profileToDisplay?.fullName || appwriteUser.name || "User"}
            </h2>
            <p className="text-muted-foreground">{appwriteUser.email}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Member since:{" "}
              {new Date(
                appwriteUser.$createdAt || Date.now()
              ).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="text-lg font-medium mb-2">Contact Information</h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Email:</span>{" "}
              {appwriteUser.email || "Not set"}
            </p>
            <p>
              <span className="font-medium">Phone:</span>{" "}
              {profileToDisplay?.phone || appwriteUser.phone || "Not set"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Section: Edit Profile Details
function EditProfileSection() {
  const auth = useAuth();
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (auth.isAuthenticated && auth.user && auth.profile) {
      setName(auth.profile.fullName || auth.user.name || "");
      setPhone(auth.profile.phone || auth.user.phone || "");
      setAvatarPreview(
        auth.profile.avatarUrl || auth.user.prefs?.avatarUrl || null
      );
    }
  }, [auth.isAuthenticated, auth.user, auth.profile]);

  const updateUserMutation = trpc.updateUser.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      if (auth.isAuthenticated && auth.user) {
        utils.getUserById.invalidate({ userId: auth.user.$id });
      }
    },
    onError: (error) =>
      toast.error(`Failed to update profile: ${error.message}`),
  });

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth.isAuthenticated || !auth.user) return;

    const updateData: { fullName?: string; phone?: string } = {};
    if (name !== (auth.profile?.fullName || auth.user?.name))
      updateData.fullName = name;
    if (phone !== (auth.profile?.phone || auth.user?.phone))
      updateData.phone = phone;

    if (Object.keys(updateData).length === 0) {
      toast.info("No changes to save.");
      return;
    }
    try {
      const schemaToValidate = updateUserSchema.pick({
        fullName: updateData.fullName ? true : undefined,
        phone: updateData.phone ? true : undefined,
      });
      schemaToValidate.parse(updateData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => toast.error(err.message));
        return;
      }
      toast.error("Invalid data.");
      return;
    }
    updateUserMutation.mutate(updateData);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type. Please select an image.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("File too large. Maximum size is 5MB.");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !auth.isAuthenticated || !auth.user) {
      toast.info("Please select an image file first.");
      return;
    }
    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    formData.append("userId", auth.user.$id);

    try {
      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error?.message || result.details || "Avatar upload failed"
        );

      toast.success("Avatar updated successfully!");
      if (result.avatarUrl) setAvatarPreview(result.avatarUrl);
      utils.getUserById.invalidate({ userId: auth.user.$id });
      setAvatarFile(null);
    } catch (error: any) {
      toast.error(`Failed to upload avatar: ${error.message}`);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!auth.isAuthenticated || !auth.user) return <Loading />;

  return (
    <Card className="rounded-lg border shadow-sm">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Update your personal information and avatar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32 relative group">
            <AvatarImage src={avatarPreview || ""} alt={name || "User"} />
            <AvatarFallback>
              {(name || auth.user.name)?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-1 right-1 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change avatar"
            >
              <Edit3 className="h-4 w-4" />
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
              disabled={isUploadingAvatar}
              size="sm"
            >
              {isUploadingAvatar ? <Loading /> : null}
              {isUploadingAvatar ? "Uploading..." : "Upload New Avatar"}
            </Button>
          )}
        </div>
        <Separator />
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={updateUserMutation.isPending}
                autoComplete="name"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., +1234567890"
                disabled={updateUserMutation.isPending}
                autoComplete="tel"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-email">Email Address</Label>
            <Input
              id="edit-email"
              value={auth.user.email || ""}
              readOnly
              disabled
              className="cursor-not-allowed bg-muted/50"
            />
            {/* <FormDescription>Email cannot be changed here.</FormDescription> */}
          </div>
          <Button
            type="submit"
            disabled={
              updateUserMutation.isPending ||
              (!avatarFile &&
                name === (auth.profile?.fullName || auth.user?.name || "") &&
                phone === (auth.profile?.phone || auth.user?.phone || ""))
            }
          >
            {updateUserMutation.isPending ? <Loading /> : null}
            {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Section: My Businesses
function MyBusinessesSection() {
  const auth = useAuth();
  if (!auth.isAuthenticated) return <Loading />;
  return (
    <Card className="rounded-lg border shadow-sm">
      <CardHeader>
        <CardTitle>My Businesses</CardTitle>
        <CardDescription>Manage your registered businesses.</CardDescription>
      </CardHeader>
      <CardContent>
        <UserBusinesses />
      </CardContent>
    </Card>
  );
}

// Section: Application Settings
function AppSettingsSection() {
  const auth = useAuth();
  const utils = trpc.useUtils();

  const {
    data: currentSettings,
    isLoading: isLoadingSettings,
    error: settingsError,
  } = trpc.getUserSettings.useQuery(undefined, {
    enabled: !!auth.isAuthenticated,
  });

  const updateSettingsMutation = trpc.updateUserSettings.useMutation({
    onSuccess: () => {
      toast.success("Settings updated successfully!");
      utils.getUserSettings.invalidate();
    },
    onError: (error) =>
      toast.error(`Failed to update settings: ${error.message}`),
  });

  const form = useForm({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: currentSettings || userSettingsSchema.parse({}), // Ensure defaultValues are always valid
  });

  useEffect(() => {
    if (currentSettings) {
      form.reset(currentSettings);
    } else {
      form.reset(userSettingsSchema.parse({})); // Reset to default schema if currentSettings is undefined
    }
  }, [currentSettings, form]);

  const onSubmitSettings = (data: UserSettings) => {
    updateSettingsMutation.mutate(data);
  };

  if (!auth.isAuthenticated) return <Loading />;
  if (isLoadingSettings)
    return (
      <div className="flex justify-center py-10 h-[20vh]">
        <Loading />
      </div>
    );
  if (settingsError)
    return (
      <p className="text-red-500">
        Error loading settings: {settingsError.message}
      </p>
    );

  return (
    <Card className="rounded-lg border shadow-sm">
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
        <CardDescription>
          Customize your application experience.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitSettings)}>
          <CardContent className="space-y-6">
            <Card className="rounded-lg border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="notifications.newMessagesEmail"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          New Messages by Email
                        </FormLabel>
                        <FormDescription>
                          Receive email notifications for new messages in your
                          inbox.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={updateSettingsMutation.isPending}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notifications.businessUpdatesEmail"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Business Updates by Email
                        </FormLabel>
                        <FormDescription>
                          Get notified about important updates related to your
                          businesses.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={updateSettingsMutation.isPending}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="rounded-lg border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Theme Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Appearance</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                          disabled={updateSettingsMutation.isPending}
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="light" />
                            </FormControl>
                            <FormLabel className="font-normal">Light</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="dark" />
                            </FormControl>
                            <FormLabel className="font-normal">Dark</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="system" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              System
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </CardContent>
          <CardFooter className="mt-2">
            <Button
              type="submit"
              disabled={
                !form.formState.isDirty || updateSettingsMutation.isPending
              }
            >
              {updateSettingsMutation.isPending ? <Loading /> : null}
              {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

// Section: Security (Password Management)
function SecuritySection() {
  const auth = useAuth();
  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const changePasswordMutation = trpc.changePassword.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Password changed successfully!");
        form.reset();
      } else {
        toast.error(
          data.message ||
            "Failed to change password. Please check your current password."
        );
      }
    },
    onError: (error) =>
      toast.error(`Error changing password: ${error.message}`),
  });

  const onSubmitPassword = (data: ChangePasswordInput) => {
    changePasswordMutation.mutate(data);
  };

  if (!auth.isAuthenticated) return <Loading />;

  return (
    <Card className="rounded-lg border shadow-sm">
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>Manage your account password.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitPassword)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormDescription>Minimum 8 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="mt-2"
            >
              {changePasswordMutation.isPending ? <Loading /> : null}
              {changePasswordMutation.isPending
                ? "Updating..."
                : "Update Password"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

// Section: Referrals
function ReferralSection() {
  const auth = useAuth();
  if (!auth.isAuthenticated || !auth.user) return <Loading />;

  const referralCode = auth.user.$id.slice(-8).toUpperCase();
  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth?ref=${referralCode}`
      : "";

  const copyToClipboard = (textToCopy: string, type: string) => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => toast.success(`${type} copied to clipboard!`))
      .catch(() => toast.error(`Failed to copy ${type}.`));
  };

  return (
    <Card className="rounded-lg border shadow-sm">
      <CardHeader>
        <CardTitle>Refer a Friend</CardTitle>
        <CardDescription>
          Share your referral link or code to earn rewards when your friends
          sign up.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="referral-link" className="text-sm font-medium">
            Your Unique Referral Link
          </Label>
          <div className="flex items-center space-x-2 mt-1">
            <Input
              id="referral-link"
              value={referralLink}
              readOnly
              className="bg-muted/50 flex-grow"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(referralLink, "Link")}
              aria-label="Copy referral link"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="referral-code" className="text-sm font-medium">
            Your Referral Code
          </Label>
          <div className="flex items-center space-x-2 mt-1">
            <Input
              id="referral-code"
              value={referralCode}
              readOnly
              className="bg-muted/50 flex-grow"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(referralCode, "Code")}
              aria-label="Copy referral code"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Separator />
        <div>
          <h4 className="font-medium mb-2">How it works:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Share your unique referral link or code with friends.</li>
            <li>
              When a friend signs up using your link or code, they get a bonus.
            </li>
            <li>
              You also receive a reward for each successful referral. (Reward
              details coming soon!)
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Referral program terms and conditions apply.
        </p>
      </CardFooter>
    </Card>
  );
}

// Section: Billing
function BillingSection() {
  const auth = useAuth();
  const {
    data: subscriptionData,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
  } = trpc.getUserSubscription.useQuery(undefined, {
    enabled: !!auth.isAuthenticated,
  });
  const {
    data: paymentHistoryData,
    isLoading: isLoadingHistory,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error: historyError,
  } = trpc.getPaymentHistory.useInfiniteQuery(
    { limit: 5 },
    {
      enabled: !!auth.isAuthenticated,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const handleManageSubscription = () =>
    toast.info("Subscription management is coming soon!");

  if (!auth.isAuthenticated) return <Loading />;

  const allTransactions =
    paymentHistoryData?.pages.flatMap((page) => page.transactions) ?? [];

  return (
    <div className="space-y-8">
      <Card className="rounded-lg border shadow-sm">
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>
            View and manage your current subscription plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingSubscription && (
            <div className="flex justify-start h-[20vh]">
              <Loading />
            </div>
          )}
          {subscriptionError && (
            <p className="text-red-500">
              Error loading subscription: {subscriptionError.message}
            </p>
          )}
          {subscriptionData && !isLoadingSubscription && !subscriptionError && (
            <div className="space-y-3">
              <p>
                <strong>Plan:</strong> {subscriptionData.planId || "N/A"}
              </p>
              <p>
                <strong>Status:</strong>
                <span
                  className={`ml-2 capitalize px-2 py-1 text-xs rounded-full font-medium ${
                    subscriptionData.status === "active"
                      ? "bg-green-100 text-green-700"
                      : subscriptionData.status === "past_due"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {subscriptionData.status || "N/A"}
                </span>
              </p>
              <p>
                <strong>Renews/Expires:</strong>{" "}
                {subscriptionData.currentPeriodEnd
                  ? format(new Date(subscriptionData.currentPeriodEnd), "PPP")
                  : "N/A"}
              </p>
            </div>
          )}
          {subscriptionData &&
            subscriptionData.status === "none" &&
            !isLoadingSubscription && <p>No active subscription.</p>}
        </CardContent>
        <CardFooter>
          <Button onClick={handleManageSubscription} variant="outline">
            Manage Subscription
          </Button>
        </CardFooter>
      </Card>

      <Card className="rounded-lg border shadow-sm">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            Review your past transactions and invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory && !paymentHistoryData && (
            <div className="flex justify-start h-[20vh]">
              <Loading />
            </div>
          )}
          {historyError && (
            <p className="text-red-500">
              Error loading payment history: {historyError.message}
            </p>
          )}
          {!isLoadingHistory && allTransactions.length === 0 && (
            <p>No payment history found.</p>
          )}
          {allTransactions.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allTransactions.map((tx) => (
                  <TableRow key={tx.$id || tx.providerTransactionId}>
                    <TableCell>{format(new Date(tx.date), "PP")}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(tx.amount, tx.currency)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`capitalize px-2 py-1 text-xs rounded-full font-medium ${
                          tx.status === "succeeded"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {tx.invoiceUrl ? (
                        <Button
                          variant="link"
                          size="sm"
                          asChild
                          className="p-0 h-auto"
                        >
                          <a
                            href={tx.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Invoice
                          </a>
                        </Button>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {hasNextPage && (
            <div className="mt-6 text-center">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
              >
                {isFetchingNextPage ? <Loading /> : null}
                {isFetchingNextPage ? "Loading..." : "Load More Transactions"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Main Profile Page Component
function MainNav({
  items,
  selected,
  onSelect,
}: {
  items: { value: string; label: string; icon: any }[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <nav className="flex space-x-2">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onSelect(item.value)}
          className={cn(
            "inline-flex items-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            selected === item.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-muted"
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </button>
      ))}
    </nav>
  );
}

// Add SignOutButton component
function SignOutButton() {
  const auth = useAuth();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <LogOut className="h-5 w-5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign Out</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to sign out of your account?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => auth.logout()}>
            Sign Out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function ProfilePage() {
  const auth = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loading />
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    if (typeof window !== "undefined") {
      redirect("/auth?next=" + window.location.pathname);
    }
    return null;
  }

  const navigationItems = [
    { value: "overview", label: "Overview", icon: User },
    { value: "edit-profile", label: "Edit Profile", icon: Edit3 },
    { value: "businesses", label: "My Businesses", icon: Briefcase },
    { value: "settings", label: "App Settings", icon: Settings },
    { value: "security", label: "Security", icon: ShieldCheck },
    { value: "referrals", label: "Referrals", icon: Share2 },
    { value: "billing", label: "Billing", icon: CreditCard },
  ];

  const contentComponents: Record<string, JSX.Element> = {
    overview: <ProfileOverviewSection />,
    "edit-profile": <EditProfileSection />,
    businesses: <MyBusinessesSection />,
    settings: <AppSettingsSection />,
    security: <SecuritySection />,
    referrals: <ReferralSection />,
    billing: <BillingSection />,
  };

  return (
    <div className="flex flex-col space-y-8 p-20 h-[80vh]">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Account Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account preferences and settings
            </p>
          </div>
          <SignOutButton />
        </div>
        <ScrollArea className="w-full">
          <div className="flex pb-4">
            <MainNav
              items={navigationItems}
              selected={selectedTab}
              onSelect={setSelectedTab}
            />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="flex-1 space-y-4">
        <div className="grid gap-4">
          <Suspense
            fallback={
              <div className="flex justify-center py-10">
                <Loading />
              </div>
            }
          >
            {contentComponents[selectedTab]}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
