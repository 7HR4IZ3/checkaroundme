"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc/client";
// Removed direct import of flutterwave functions
import { useAuth } from "@/lib/hooks/useClientAuth"; // For fetching user data
import { toast } from "sonner"; // For displaying errors

// Plan interface - Ensure this matches the data structure returned by your tRPC procedure
interface Plan {
  id: number;
  name: string;
  amount: number;
  interval: string;
  currency: string;
  description?: string;
  status?: string; // Flutterwave plans have a status
  plan_token?: string; // Flutterwave plan token
  // Add any other relevant fields from the Flutterwave Plan object
}

export default function OnboardingSubscriptionPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  // Removed local loading/error states managed by tRPC hooks
  // const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  // const [isSubscribing, setIsSubscribing] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Get user data from auth context

  // Fetch plans using tRPC query
  const {
    data: plansData,
    isLoading: isLoadingPlans,
    error: plansError,
  } = trpc.getAllPaymentPlans.useQuery(undefined, {
    // Pass input if needed
    refetchOnWindowFocus: false, // Optional: prevent refetching on window focus
    staleTime: 1000 * 60 * 5, // Optional: Cache plans for 5 minutes
  });

  // Use tRPC mutation for initiating payment
  const initiatePaymentMutation = trpc.initiatePayment.useMutation({
    onSuccess: (data) => {
      if (data?.link) {
        router.push(data.link); // Redirect to Flutterwave payment page
      } else {
        // This case should ideally be handled by the mutation throwing an error
        toast.error("Payment Initiation Failed", {
          description: "Could not get payment link.",
        });
      }
    },
    onError: (error) => {
      console.error("Subscription failed:", error);
      toast.error("Subscription Failed", {
        description: error.message || "An unexpected error occurred.",
      });
    },
  });

  // Derived state for plans from query data
  const plans: Plan[] = (plansData || []) as Plan[];

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      toast.error("No Plan Selected", {
        description: "Please select a plan to subscribe.",
      });
      return;
    }

    if (!user || !user.email) {
      toast.error("Authentication Error", {
        description: "User information not available. Please log in again.",
      });
      return;
    }

    // Prepare input for the tRPC mutation
    const mutationInput = {
      payment_plan: selectedPlan.id,
      amount: selectedPlan.amount,
      currency: selectedPlan.currency,
      customer: {
        email: user.email,
        name: user.name || "Valued Customer",
        // phonenumber: user.phone, // Add if available and needed
      },
      redirect_url: `${window.location.origin}/auth/payment-status`,
      meta: {
        userId: user.$id, // Assuming Appwrite user ID is $id
        planId: selectedPlan.id,
      },
      customizations: {
        title: "Checkaroundme Subscription",
        description: `Payment for ${selectedPlan.name}`,
        logo: `${window.location.origin}/images/logo.png`,
      },
      // tx_ref is now generated server-side in the tRPC procedure
    };

    // Call the mutation
    initiatePaymentMutation.mutate(mutationInput);
  };

  // Use tRPC loading state
  if (isLoadingPlans) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading subscription plans...
      </div>
    );
  }

  // Use tRPC error state
  if (plansError) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-500">
        <p>Error loading plans:</p>
        <p>{plansError.message}</p>
        {/* Optionally add a retry button */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Choose Your Subscription Plan
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Select a plan to unlock premium features and get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display mutation error if any */}
          {initiatePaymentMutation.error && (
            <p className="text-red-500 text-center">
              {initiatePaymentMutation.error.message}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.length === 0 && !isLoadingPlans && (
              <p className="text-center text-muted-foreground col-span-full">
                No subscription plans available at the moment.
              </p>
            )}
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all ${
                  selectedPlan?.id === plan.id
                    ? "ring-2 ring-primary shadow-lg"
                    : "hover:shadow-md"
                }`}
                onClick={() => handleSelectPlan(plan)}
              >
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.description || `Billed ${plan.interval}.`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {plan.currency} {plan.amount / 100}{" "}
                    {/* Assuming amount is in kobo/cents */}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    per {plan.interval}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4">
          <Button
            onClick={handleSubscribe}
            disabled={!selectedPlan || initiatePaymentMutation.isPending} 
            className="w-full max-w-xs"
          >
            {initiatePaymentMutation.isPending
              ? "Processing..."
              : `Subscribe to ${selectedPlan?.name || "Selected Plan"}`}
          </Button>
          <Button variant="link" onClick={() => router.push("/")}>
            Skip for now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
