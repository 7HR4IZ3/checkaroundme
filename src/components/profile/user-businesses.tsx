"use client";

import React, { useState } from "react"; // Added useState
import Link from "next/link";
import { useRouter } from "next/navigation"; // Corrected import
import { trpc } from "@/lib/trpc/client";
import { useAuth } from "@/lib/hooks/useClientAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import Loading from "@/components/ui/loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog, // Keep this if it's from Radix
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Ensure this is the correct path for your ShadCN AlertDialog
import { Badge } from "@/components/ui/badge"; // Corrected Badge import
import { toast } from "sonner"; // Added toast
import { Business } from "@/lib/schema"; // Added Business type import
import { PlusCircle, Edit3, ExternalLink, Power, PowerOff } from "lucide-react";
// Removed incorrect router import from next/router
// Removed incorrect AlertDialogHeader, AlertDialogFooter from ../ui/alert-dialog if they are part of the main AlertDialog import

export function UserBusinesses() {
  const auth = useAuth();
  const router = useRouter(); // Moved and corrected
  const utils = trpc.useUtils(); // Moved

  // Moved state and mutations inside the component
  const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);
  const [selectedBusinessForStatusChange, setSelectedBusinessForStatusChange] =
    useState<Business | null>(null);
  const [targetStatus, setTargetStatus] = useState<
    "active" | "disabled" | null
  >(null);

  const {
    data: businesses,
    isLoading,
    error,
  } = trpc.getBusinessesByUserId.useQuery(
    { userId: auth.isAuthenticated && auth.user ? auth.user.$id : "" },
    { enabled: !!auth.isAuthenticated && !!auth.user }
  );

  const updateBusinessMutation = trpc.updateBusiness.useMutation({
    onSuccess: (updatedBusiness) => {
      if (auth.user) {
        utils.getBusinessesByUserId.invalidate({ userId: auth.user.$id });
      }
      updatedBusiness &&
        toast.success(
          `Business "${updatedBusiness.name}" ${
            updatedBusiness.status === "active" ? "activated" : "deactivated"
          } successfully.`
        );
      setShowStatusConfirmModal(false);
      setSelectedBusinessForStatusChange(null);
    },
    onError: (error, variables) => {
      const businessName =
        businesses?.find((b) => b.$id === variables.businessId)?.name ||
        "this business";
      toast.error(`Failed to update status for "${businessName}".`, {
        description: error.message,
      });
      setShowStatusConfirmModal(false);
      setSelectedBusinessForStatusChange(null);
    },
  });

  const handleToggleBusinessStatus = (business: Business) => {
    if (!auth.user) return;
    const newStatus = business.status === "active" ? "disabled" : "active";
    setSelectedBusinessForStatusChange(business);
    setTargetStatus(newStatus);
    setShowStatusConfirmModal(true);
  };

  const confirmToggleBusinessStatus = () => {
    if (!selectedBusinessForStatusChange || targetStatus === null || !auth.user)
      return;

    if (
      targetStatus === "active" &&
      auth.user.prefs?.subscriptionStatus !== "active"
    ) {
      toast.error("Subscription Required", {
        description: `To activate "${selectedBusinessForStatusChange.name}", an active subscription is required. Please subscribe to proceed.`,
        action: {
          label: "Subscribe",
          onClick: () => {
            setShowStatusConfirmModal(false);
            router.push("/business/payment");
          },
        },
        duration: 8000,
      });
      return;
    }

    updateBusinessMutation.mutate({
      businessId: selectedBusinessForStatusChange.$id,
      data: { status: targetStatus },
    });
  };

  if (!auth.isAuthenticated || !auth.user) {
    // Added check for auth.user
    return (
      <Alert>
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please log in to view your businesses.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load your businesses: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-semibold mb-2">No Businesses Yet</h3>
        <p className="text-muted-foreground mb-4">
          You haven't created any businesses. Get started by adding one!
        </p>
        <Button asChild>
          <Link href="/business/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Business
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Businesses</h2>
        <Button asChild variant="outline">
          <Link href="/business/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Business
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {businesses.map((business) => (
          <Card key={business.$id}>
            <CardHeader>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="truncate flex items-center">
                    {business.name}
                    <Badge
                      variant={
                        business.status === "active" ? "default" : "destructive"
                      } // Use destructive for inactive for better visual cue
                      className="ml-2 text-xs px-1.5 py-0.5 whitespace-nowrap" // Added whitespace-nowrap
                    >
                      {business.status === "active" ? (
                        <Power className="mr-1 h-3 w-3" />
                      ) : (
                        <PowerOff className="mr-1 h-3 w-3" />
                      )}
                      {business.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="truncate">
                    {business.category.join(", ") || "No category"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                {business.about || "No description provided."}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 pt-0">
              <Button
                variant={business.status === "active" ? "outline" : "default"}
                size="sm"
                onClick={() => handleToggleBusinessStatus(business)}
                disabled={
                  updateBusinessMutation.isPending &&
                  selectedBusinessForStatusChange?.$id === business.$id
                }
                className="w-full sm:w-auto order-last sm:order-first mt-2 sm:mt-0" // Button below on small screens
              >
                {updateBusinessMutation.isPending &&
                selectedBusinessForStatusChange?.$id === business.$id ? (
                  "Updating..."
                ) : business.status === "active" ? (
                  <>
                    <PowerOff className="mr-2 h-4 w-4" /> Deactivate
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4" /> Activate
                  </>
                )}
              </Button>
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="flex-1 sm:flex-initial"
                >
                  <Link href={`/business/${business.$id}/edit`}>
                    <Edit3 className="mr-2 h-4 w-4" /> Edit
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-initial"
                >
                  <Link href={`/business/${business.$id}`} target="_blank">
                    View <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedBusinessForStatusChange && (
        <AlertDialog
          open={showStatusConfirmModal}
          onOpenChange={(isOpen) => {
            setShowStatusConfirmModal(isOpen);
            if (!isOpen) setSelectedBusinessForStatusChange(null); // Reset on close
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
              <AlertDialogDescription>
                {targetStatus === "active" &&
                auth.user?.prefs?.subscriptionStatus !== "active" ? (
                  <>
                    To activate "
                    <strong>{selectedBusinessForStatusChange.name}</strong>", an
                    active subscription is required. Please subscribe to
                    proceed.
                  </>
                ) : (
                  `Are you sure you want to ${
                    targetStatus === "active" ? "activate" : "deactivate"
                  } "${selectedBusinessForStatusChange.name}"?`
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              {targetStatus === "active" &&
              auth.user?.prefs?.subscriptionStatus !== "active" ? (
                <Button
                  onClick={() => {
                    setShowStatusConfirmModal(false);
                    router.push("/business/payment");
                  }}
                  variant="default" // Or some other appropriate variant
                >
                  Go to Subscription
                </Button>
              ) : (
                <AlertDialogAction
                  onClick={confirmToggleBusinessStatus}
                  disabled={updateBusinessMutation.isPending}
                  className={
                    targetStatus === "active"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }
                >
                  {updateBusinessMutation.isPending
                    ? "Updating..."
                    : `Confirm ${
                        targetStatus === "active"
                          ? "Activation"
                          : "Deactivation"
                      }`}
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
