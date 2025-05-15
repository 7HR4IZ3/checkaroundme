"use client";

import { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/useClientAuth";
import BusinessForm from "@/components/business/business-form"; // Import the new component
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function BusinessCreateForm() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) return redirect("/auth");

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [newlyCreatedBusinessId, setNewlyCreatedBusinessId] = useState<
    string | null
  >(null);

  const createBusiness = trpc.createBusiness.useMutation();
  const handleCreateBusiness = async (formData: any) => {
    if (!user?.$id) {
      toast.error("Error", { description: "User not authenticated." });
      return;
    }

    const businessStatus =
      user.prefs.subscriptionStatus === "active" ? "active" : "disabled";

    try {
      const result = await createBusiness.mutateAsync({
        ...formData,
        ownerId: user.$id,
        userId: user.$id, // Assuming userId is also needed for creation
        status: businessStatus,
      });
      toast.success("Business Created", {
        description: `Your business has been successfully created. Status: ${businessStatus}.`,
      });

      if (businessStatus === "disabled") {
        setNewlyCreatedBusinessId(result.$id);
        setShowSubscriptionModal(true);
      } else {
        router.push(`/business/${result.$id}`);
      }
    } catch (error: any) {
      console.error("Failed to create business", error);
      if (error.data?.httpStatus === 400) {
        const errors = JSON.parse(error.message);
        // You might want to handle specific field errors here if needed,
        // but the BusinessForm component now handles basic required field validation.
        console.error("Validation errors:", errors);
        toast.error("Validation Error", {
          description: "Please check the form for errors.",
        });
      } else {
        toast.error("Failed to Create Business", {
          description: error.message || "An unexpected error occurred.",
        });
      }
    }
  };

  return (
    <>
      <BusinessForm
        onSubmit={handleCreateBusiness}
        submitButtonText="Create Business"
        isSubmitting={createBusiness.isPending}
      />
      {showSubscriptionModal && newlyCreatedBusinessId && (
        <Dialog
          open={showSubscriptionModal}
          onOpenChange={setShowSubscriptionModal}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Activate Your Business</DialogTitle>
              <DialogDescription>
                Your business has been created but is currently inactive. To
                make it visible and active, please subscribe to one of our
                plans.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSubscriptionModal(false);
                  router.push(`/business/${newlyCreatedBusinessId}`);
                }}
              >
                View Business (Inactive)
              </Button>
              <Button
                onClick={() => {
                  setShowSubscriptionModal(false);
                  router.push("/business/payment");
                }}
              >
                Go to Subscription
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
