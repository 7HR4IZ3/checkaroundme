"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { useAuth } from "@/lib/hooks/useClientAuth";
import { toast } from "sonner";
import { IPlan } from "paystack-sdk/dist/plan";

export default function OnboardingSubscriptionPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/auth?next=" + window.location.pathname);
    } else if (user?.prefs.subscriptionStatus === "active") {
      router.back();
    }
  }, [isAuthenticated, user, router]);

  const {
    data: plansData,
    isLoading: isLoadingPlans,
    error: plansError,
  } = trpc.listPlans.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 15,
  });

  const initializeTransactionMutation = trpc.initializeTransaction.useMutation({
    onSuccess: (data) => {
      if (data?.authorization_url) {
        router.push(data.authorization_url);
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

  const handleSubscribe = async (planToSubscribe?: IPlan) => {
    const targetPlan = planToSubscribe;
    if (!targetPlan) {
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

    const isEligibleForTwoMonthFreeOffer = !user?.prefs.subscriptionStatus; // This would be undefined for new users;

    const mutationInput = {
      email: user.email,
      amount: targetPlan.amount,
      currency: targetPlan.currency,
      callback_url: `${window.location.origin}/api/paystack/verify`,
      metadata: {
        userId: user.$id,
        planId: targetPlan.id,
        planCode: targetPlan.plan_code,
        interval: targetPlan.interval,
        isEligibleForTwoMonthFreeOffer: isEligibleForTwoMonthFreeOffer,
        custom_fields: [
          {
            display_name: "User Name",
            variable_name: "user_name",
            value: user.name || "N/A",
          },
        ],
      },
    };
    initializeTransactionMutation.mutate(mutationInput);
  };

  if (isAuthenticated === null || isLoadingPlans || plansError) {
    if (isAuthenticated === null || (isAuthenticated === true && !user)) {
      return (
        <div className="flex justify-center items-center h-screen bg-[#F8F7FF]">
          Loading authentication...
        </div>
      );
    }

    if (isLoadingPlans) {
      return (
        <div className="flex justify-center items-center h-screen bg-[#F8F7FF]">
          Loading subscription plans...
        </div>
      );
    }

    if (plansError) {
      return (
        <div className="flex flex-col justify-center items-center h-screen text-red-600 bg-[#F8F7FF] p-6">
          <h2 className="text-2xl font-semibold mb-3">Error Loading Plans</h2>
          <p className="text-center text-lg">{plansError.message}</p>
          <Button
            onClick={() => router.refresh()}
            className="mt-6 px-6 py-2.5 text-base rounded-lg"
          >
            Try Again
          </Button>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-5xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">Select your plan</h1>
        <p className="text-gray-600 text-lg mb-8">
          Simple, transparent pricing that grows with your business
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-white rounded-2xl p-8 shadow-lg flex flex-col relative">
            <div className="absolute -top-4 left-6">
              <span className="bg-[#F5851F] text-white text-sm px-4 py-1.5 rounded-full font-medium">
                PROMO
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Monthly Plan</h2>
              <div className="flex items-baseline justify-center mb-2">
                <span className="text-2xl font-bold">₦</span>
                <span className="text-5xl font-bold">2,050</span>
                <span className="text-xl text-gray-600">/mo</span>
              </div>
            </div>

            <div className="space-y-4 mb-8 text-left">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-1" />
                <span className="text-gray-600">
                  Pay for 1 month, get 2 months free
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-1" />
                <span className="text-gray-600">
                  Advanced business analytics
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-1" />
                <span className="text-gray-600">Priority customer support</span>
              </div>
            </div>

            <Button
              className="mt-auto w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl text-lg font-semibold"
              onClick={() =>
                handleSubscribe(
                  plansData?.find((p) => p.interval === "monthly")
                )
              }
            >
              Get started
            </Button>
          </div>

          {/* Annual Plan */}
          <div className="bg-white rounded-2xl p-8 shadow-lg flex flex-col relative border-2 border-primary">
            <div className="absolute -top-4 left-6">
              <span className="bg-[#F5851F] text-white text-sm px-4 py-1.5 rounded-full font-medium">
                BEST VALUE
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Yearly Plan</h2>
              <div className="flex items-baseline justify-center mb-2">
                <span className="text-2xl font-bold">₦</span>
                <span className="text-5xl font-bold">11,200</span>
                <span className="text-xl text-gray-600">/yr</span>
              </div>
              <p className="text-gray-500 line-through mb-1">₦24,000/yr</p>
              <p className="text-primary font-semibold">53% off</p>
            </div>

            <div className="space-y-4 mb-8 text-left">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-1" />
                <span className="text-gray-600">
                  Full year of premium features
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-1" />
                <span className="text-gray-600">
                  Advanced business analytics
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-1" />
                <span className="text-gray-600">Priority customer support</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-1" />
                <span className="text-gray-600">Best value for money</span>
              </div>
            </div>

            <Button
              className="mt-auto w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl text-lg font-semibold"
              onClick={() =>
                handleSubscribe(
                  plansData?.find((p) => p.interval === "annually")
                )
              }
            >
              Get started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
