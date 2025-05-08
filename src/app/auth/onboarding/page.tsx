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
import { IPlan } from "paystack-sdk/dist/plan";
import { interval } from "date-fns";

export default function OnboardingSubscriptionPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<IPlan | null>(null);
  // Removed local loading/error states managed by tRPC hooks
  // const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  // const [isSubscribing, setIsSubscribing] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Get user data from auth context

  // Fetch plans using Paystack tRPC query
  const {
    data: plansData,
    isLoading: isLoadingPlans,
    error: plansError,
  } = trpc.listPlans.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  // Use tRPC mutation for Paystack transaction initialization
  const initializeTransactionMutation = trpc.initializeTransaction.useMutation({
    // Using initializeTransaction
    onSuccess: (data) => {
      // Paystack returns authorization_url, access_code, reference
      if (data?.authorization_url) {
        router.push(data.authorization_url); // Redirect to Paystack payment page
      } else {
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

  // Map Paystack plan data (adjust mapping based on actual API response structure)
  const plans =
    plansData?.map((p: any) => ({
      ...p,
      description: p.description || `Billed ${p.interval}`,
    })) || [];

  const handleSelectPlan = (plan: IPlan) => {
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

    // Prepare input for the Paystack tRPC mutation
    const mutationInput = {
      email: user.email,
      amount: selectedPlan.amount, // Amount in Kobo
      currency: selectedPlan.currency, // Optional, defaults to your Paystack account currency
      plan: selectedPlan.plan_code, // Use Paystack plan_code
      callback_url: `${window.location.origin}/auth/payment-status`, // Paystack uses callback_url
      metadata: {
        userId: user.$id,
        planId: selectedPlan.id,
        planCode: selectedPlan.plan_code,
        interval: selectedPlan.interval,
        custom_fields: [
          {
            display_name: "User Name",
            variable_name: "user_name",
            value: user.name || "N/A",
          },
        ],
      },
      // reference: `CKM-SUB-${Date.now()}-${user.$id}-${selectedPlan.plan_code}` // Optional: Generate ref here or let Paystack/tRPC handle it
    };

    // Call the Paystack mutation
    initializeTransactionMutation.mutate(mutationInput);
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
          {initializeTransactionMutation.error && (
            <p className="text-red-500 text-center">
              {initializeTransactionMutation.error.message}
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
            disabled={!selectedPlan || initializeTransactionMutation.isPending}
            className="w-full max-w-xs"
          >
            {initializeTransactionMutation.isPending
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
