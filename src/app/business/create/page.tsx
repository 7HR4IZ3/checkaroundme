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

  if (!isAuthenticated)
    return redirect("/auth?next=" + window.location.pathname);

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [newlyCreatedBusinessId, setNewlyCreatedBusinessId] = useState<
    string | null
  >(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const createBusiness = trpc.createBusiness.useMutation();

  // Add business count query
  const { data: businessCount } = trpc.getUserBusinessCount.useQuery(
    { userId: user?.$id ?? "" },
    { enabled: !!user }
  );

  const handleCreateBusiness = async (formData: any) => {
    if (createBusiness.isPending || createBusiness.isSuccess) return;

    if (!user?.$id) {
      toast.error("Error", { description: "User not authenticated." });
      return;
    }

    // Check business limit
    if (businessCount && businessCount >= 1) {
      setShowLimitModal(true);
      return;
    }

    const businessStatus =
      user.prefs.subscriptionStatus === "active" ? "active" : "disabled";

    try {
      const result = await createBusiness.mutateAsync({
        ...formData,
        status: businessStatus,
      });
      toast.success("Business Created", {
        description: `Your business has been successfully created. Status: ${businessStatus}.`,
      });

      if (businessStatus === "disabled") {
        setNewlyCreatedBusinessId(result.$id);
        setShowSubscriptionModal(true);
      } else {
        redirect(`/business/${result.$id}`);
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

      {/* Subscription Modal */}
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

      {/* Business Limit Modal */}
      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Business Limit Reached</DialogTitle>
            <DialogDescription>
              You can only create one business at a time. To create another
              business, please upgrade your subscription plan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowLimitModal(false);
                router.push("/business/my-businesses");
              }}
            >
              View My Business
            </Button>
            <Button
              onClick={() => {
                setShowLimitModal(false);
                router.push("/business/payment");
              }}
            >
              Upgrade Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
