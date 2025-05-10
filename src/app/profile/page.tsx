"use client";

import { Suspense, useState, useEffect, useRef } from "react";
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
  ChangePasswordInput, // Ensure this is imported if used directly as a type
} from "@/lib/schema";
import { z } from "zod";
// import { ProfileSubNav } from "@/components/profile/profile-sub-nav"; // No longer needed
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
} from "lucide-react"; // Added ListChecks for consistency

// Section: View Profile
function ViewProfileSection() {
  const auth = useAuth();
  if (!auth.isAuthenticated || !auth.user) return <Loading />;

  const profileToDisplay = auth.profile;
  const appwriteUser = auth.user;

  return (
    <div className="py-6">
      {" "}
      {/* Changed from section to div for tab content */}
      {/* Removed h2 title, as tab trigger serves this purpose */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 space-y-6">
          <div className="flex flex-col items-center">
            <Avatar className="h-32 w-32 mb-4">
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
            <h3 className="text-lg font-medium">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="view-name">Full Name</Label>
                <Input
                  id="view-name"
                  value={profileToDisplay?.fullName || appwriteUser.name || ""}
                  readOnly
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="view-email">Email</Label>
                <Input
                  id="view-email"
                  value={appwriteUser.email || ""}
                  readOnly
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="view-phone">Phone</Label>
                <Input
                  id="view-phone"
                  value={profileToDisplay?.phone || appwriteUser.phone || ""}
                  readOnly
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Section: Configure Details
function ConfigureDetailsSection() {
  const auth = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false); // New state for loading
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

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
      if (auth.isAuthenticated && auth.user)
        utils.getUserById.invalidate({ userId: auth.user.$id });
    },
    onError: (error) =>
      toast.error(`Failed to update profile: ${error.message}`),
  });

  // Removed trpc.uploadAvatar.useMutation()

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
    // The tRPC procedure now gets userId from context, so we only pass the data
    updateUserMutation.mutate(updateData);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large (max 5MB).");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !auth.isAuthenticated || !auth.user) {
      toast.info("Select image first.");
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

      if (!response.ok) {
        throw new Error(result.error?.message || result.details || "Avatar upload failed");
      }

      toast.success("Avatar updated successfully!");
      if (result.avatarUrl) {
        setAvatarPreview(result.avatarUrl);
      }
      utils.getUserById.invalidate({ userId: auth.user.$id });
      setAvatarFile(null);
    } catch (error: any) {
      toast.error(`Failed to upload avatar: ${error.message}`);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!auth.isAuthenticated || !auth.user) return null;

  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 space-y-6">
          <div className="flex flex-col items-center">
            <Avatar className="h-32 w-32 mb-4 relative group">
              <AvatarImage src={avatarPreview || ""} alt={name || "User"} />
              <AvatarFallback>
                {(name || auth.user.name)?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-1 right-1 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Edit avatar"
              >
                <Settings className="h-4 w-4" /> {/* Changed icon */}
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
                className="mt-2"
              >
                {isUploadingAvatar
                  ? "Uploading..."
                  : "Upload Avatar"}
              </Button>
            )}
          </div>
        </div>
        <div className="w-full md:w-2/3 space-y-6">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={updateUserMutation.isPending}
                  autoComplete="name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  value={auth.user.email || ""}
                  readOnly
                  disabled
                  className="cursor-not-allowed bg-muted/50 mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., +1234567890"
                  disabled={updateUserMutation.isPending}
                  autoComplete="tel"
                  className="mt-1"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={
                updateUserMutation.isPending ||
                (name === (auth.profile?.fullName || auth.user?.name || "") &&
                  phone === (auth.profile?.phone || auth.user?.phone || ""))
              }
            >
              {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Section: My Businesses
function MyBusinessesSection() {
  const auth = useAuth();
  if (!auth.isAuthenticated) return null;
  return (
    <div className="py-6">
      <UserBusinesses />
    </div>
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
      toast.success("Settings updated!");
      utils.getUserSettings.invalidate();
    },
    onError: (error) => toast.error(`Update failed: ${error.message}`),
  });
  const form = useForm({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: userSettingsSchema.parse({}),
  });
  useEffect(() => {
    if (currentSettings) form.reset(currentSettings);
  }, [currentSettings, form.reset]);
  const onSubmitSettings = (data: UserSettings) =>
    updateSettingsMutation.mutate(data);

  if (!auth.isAuthenticated) return null;
  if (isLoadingSettings)
    return (
      <div className="py-6">
        <Loading />
      </div>
    );
  if (settingsError)
    return (
      <div className="py-6 text-red-500">Error: {settingsError.message}</div>
    );

  return (
    <div className="py-6">
      <form
        onSubmit={form.handleSubmit(onSubmitSettings)}
        className="space-y-8 max-w-2xl"
      >
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Controller
              name="notifications.newMessagesEmail"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-center justify-between">
                  <Label htmlFor="newMsgEmail" className="flex flex-col sp-y-1">
                    <span>New Messages by Email</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Notify for new messages.
                    </span>
                  </Label>
                  <Switch
                    id="newMsgEmail"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>
              )}
            />
            <Controller
              name="notifications.businessUpdatesEmail"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-center justify-between">
                  <Label htmlFor="bizUpdEmail" className="flex flex-col sp-y-1">
                    <span>Business Updates by Email</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Notify for business updates.
                    </span>
                  </Label>
                  <Switch
                    id="bizUpdEmail"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>
              )}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Theme Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              name="theme"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="space-y-1"
                  disabled={updateSettingsMutation.isPending}
                >
                  <div className="flex items-center sp-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light">Light</Label>
                  </div>
                  <div className="flex items-center sp-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark">Dark</Label>
                  </div>
                  <div className="flex items-center sp-x-2">
                    <RadioGroupItem value="system" id="theme-system" />
                    <Label htmlFor="theme-system">System</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </CardContent>
        </Card>
        <Button
          type="submit"
          disabled={!form.formState.isDirty || updateSettingsMutation.isPending}
        >
          {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}

// Section: Password Management
function PasswordManagementSection() {
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
        toast.success(data.message || "Password changed!");
        form.reset();
      } else {
        toast.error(data.message || "Failed to change password.");
      }
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });
  const onSubmitPassword = (data: ChangePasswordInput) =>
    changePasswordMutation.mutate(data);
  if (!auth.isAuthenticated) return null;

  return (
    <div className="py-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitPassword)}
          className="space-y-6 max-w-md"
        >
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
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
                  <Input type="password" {...field} />
                </FormControl>
                <FormDescription>Min 8 characters.</FormDescription>
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
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={changePasswordMutation.isPending}>
            {changePasswordMutation.isPending
              ? "Changing..."
              : "Change Password"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

// Section: Billing
const formatCurrency = (amount: number, currencyCode = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currencyCode,
  }).format(amount / 100);

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
    toast.info("Subscription management coming soon!");
  if (!auth.isAuthenticated) return null;
  const allTransactions =
    paymentHistoryData?.pages.flatMap((page) => page.transactions) ?? [];

  return (
    <div className="py-6">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Manage your plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingSubscription && <Loading />}
            {subscriptionError && (
              <p className="text-red-500">Error: {subscriptionError.message}</p>
            )}
            {subscriptionData &&
              !isLoadingSubscription &&
              !subscriptionError && (
                <div className="space-y-2">
                  <p>
                    <strong>Plan:</strong> {subscriptionData.planId || "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`capitalize px-2 py-1 text-xs rounded-full ${
                        subscriptionData.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {subscriptionData.status || "N/A"}
                    </span>
                  </p>
                  <p>
                    <strong>Renews/Expires:</strong>{" "}
                    {subscriptionData.currentPeriodEnd
                      ? format(
                          new Date(subscriptionData.currentPeriodEnd),
                          "PPP"
                        )
                      : "N/A"}
                  </p>
                  <Button
                    onClick={handleManageSubscription}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Manage
                  </Button>
                </div>
              )}
            {subscriptionData &&
              subscriptionData.status === "none" &&
              !isLoadingSubscription && <p>No active subscription.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Past transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingHistory && !paymentHistoryData && <Loading />}
            {historyError && (
              <p className="text-red-500">Error: {historyError.message}</p>
            )}
            {!isLoadingHistory && allTransactions.length === 0 && (
              <p>No payment history.</p>
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
                          className={`capitalize px-2 py-1 text-xs rounded-full ${
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
                          <Button variant="link" size="sm" asChild>
                            <a
                              href={tx.invoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
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
              <div className="mt-4 text-center">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  variant="outline"
                >
                  {isFetchingNextPage ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main Profile Page Component
export default function ProfilePage() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    if (typeof window !== "undefined") {
      redirect("/auth");
    }
    return null;
  }

  const tabItems = [
    {
      value: "overview",
      label: "Profile Overview",
      icon: User,
      component: <ViewProfileSection />,
    },
    {
      value: "details",
      label: "Edit Details",
      icon: Settings,
      component: <ConfigureDetailsSection />,
    },
    {
      value: "businesses",
      label: "My Businesses",
      icon: Briefcase,
      component: <MyBusinessesSection />,
    },
    {
      value: "settings",
      label: "App Settings",
      icon: ListChecks,
      component: <AppSettingsSection />,
    }, // Changed icon
    {
      value: "security",
      label: "Security",
      icon: ShieldCheck,
      component: <PasswordManagementSection />,
    },
    {
      value: "billing",
      label: "Billing",
      icon: CreditCard,
      component: <BillingSection />,
    },
  ];

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loading />
        </div>
      }
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Profile & Settings</h1>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-6">
            {tabItems.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-col sm:flex-row h-auto sm:h-10 py-2 sm:py-0"
              >
                <tab.icon className="h-5 w-5 mb-1 sm:mb-0 sm:mr-2" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabItems.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Suspense>
  );
}
