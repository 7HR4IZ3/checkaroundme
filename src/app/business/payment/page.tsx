"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";
import { useAuth } from "@/lib/hooks/useClientAuth";
import { toast } from "sonner";
import { IPlan } from "paystack-sdk/dist/plan";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

// Note: The subtle curved background decorative elements from the image
// are complex to replicate purely with Tailwind CSS and would typically
// require SVGs or custom CSS. This implementation focuses on the layout
// and styling of the functional UI components.

export default function OnboardingSubscriptionPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [isAnnualBilling, setIsAnnualBilling] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<IPlan | null>(null);
  const [expandedPlanCode, setExpandedPlanCode] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/auth");
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

  const plans: IPlan[] =
    plansData?.map((p: any) => ({
      ...p,
      description: p.description || `Billed ${p.interval}`,
    })) || [];

  const displayedPlans = plans.filter((plan) =>
    isAnnualBilling
      ? plan.interval?.toLowerCase() === "annually"
      : plan.interval?.toLowerCase() === "monthly",
  );

  useEffect(() => {
    if (displayedPlans.length > 0) {
      const proPlan = displayedPlans.find(
        (p) => p.name?.toLowerCase() === "pro",
      );
      setExpandedPlanCode(displayedPlans[0].plan_code);
      setSelectedPlan(displayedPlans[0]);
      // if (proPlan) {
      //   setExpandedPlanCode(proPlan.plan_code);
      //   setSelectedPlan(proPlan);
      // } else if (displayedPlans.length > 0 && !expandedPlanCode) {
      // } else if (displayedPlans.length === 0) {
      //   setExpandedPlanCode(null);
      //   setSelectedPlan(null);
      // }
    } else {
      setExpandedPlanCode(null);
      setSelectedPlan(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnnualBilling, plansData]);

  const handleSelectAndToggleExpand = (plan: IPlan) => {
    setSelectedPlan(plan);
    setExpandedPlanCode((current) =>
      current === plan.plan_code ? null : plan.plan_code,
    );
  };

  const handleSubscribe = async (planToSubscribe?: IPlan) => {
    const targetPlan = planToSubscribe || selectedPlan;
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

    const mutationInput = {
      email: user.email,
      amount: targetPlan.amount,
      currency: targetPlan.currency,
      plan: targetPlan.plan_code,
      callback_url: `${window.location.origin}/business/payment-status`,
      metadata: {
        userId: user.$id,
        planId: targetPlan.id,
        planCode: targetPlan.plan_code,
        interval: targetPlan.interval,
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

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
          {/* Left Column */}
          <div className="space-y-6 md:space-y-8 lg:space-y-10 lg:sticky lg:top-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold  leading-tight">
              Simple pricing <br /> for your Business
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-500">
              We have several powerful plans to showcase your business and get
              discovered as a creative entrepreneur. Everything you need.
            </p>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <Label
                onClick={() => setIsAnnualBilling(false)}
                className={`text-sm sm:text-base font-medium transition-colors hover:transparent ${
                  !isAnnualBilling ? "" : "text-gray-400"
                }`}
              >
                Bill Monthly
              </Label>
              <Switch
                id="billing-cycle"
                checked={isAnnualBilling}
                onCheckedChange={setIsAnnualBilling}
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-slate-300 relative inline-flex h-[28px] w-[52px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
              >
                <span
                  aria-hidden="true"
                  className={`${
                    isAnnualBilling ? "translate-x-[24px]" : "translate-x-0"
                  }
                    pointer-events-none inline-block h-[24px] w-[24px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                />
              </Switch>
              <Label
                onClick={() => setIsAnnualBilling(true)}
                className={`text-sm sm:text-base font-medium transition-colors hover:transparent ${
                  isAnnualBilling ? "" : "text-gray-400"
                }`}
              >
                Bill Annually
              </Label>
            </div>

            <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-xl space-y-4 sm:space-y-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 bg-primary text-white rounded-full h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center">
                  {" "}
                  {/* Adjusted size */}
                  <Check
                    className=" h-3 w-3 sm:h-4 sm:w-4"
                    strokeWidth={3}
                  />{" "}
                  {/* Adjusted size */}
                </div>
                <span className="text-gray-700 text-sm sm:text-base lg:text-lg">
                  Free 2 month trial for new user
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 bg-primary text-white rounded-full h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center">
                  {" "}
                  {/* Adjusted size */}
                  <Check
                    className=" h-3 w-3 sm:h-4 sm:w-4"
                    strokeWidth={3}
                  />{" "}
                  {/* Adjusted size */}
                </div>
                <span className="text-gray-700 text-sm sm:text-base lg:text-lg">
                  Cancel anytime you want
                </span>
              </div>
              <div className="flex justify-end">
                <Button
                  className="w-full sm:w-2/3 bg-primary hover:bg-[#4338CA]  mt-6 sm:mt-8 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl font-semibold rounded-xl sm:rounded-2xl" // Adjusted padding, font-size, and rounding
                  onClick={() => handleSubscribe()}
                  disabled={
                    !selectedPlan || initializeTransactionMutation.isPending
                  }
                >
                  {initializeTransactionMutation.isPending && selectedPlan
                    ? "Processing..."
                    : "Subscribe to Checkaroundme"}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Plan Selection */}
          <div className="space-y-4 md:space-y-6">
            {displayedPlans.map((plan) => {
              const isExpanded = expandedPlanCode === plan.plan_code;
              const isPro = plan.name?.toLowerCase() === "pro";

              return (
                <div
                  key={plan.plan_code}
                  className={`transition-all duration-300 ease-in-out overflow-hidden
                    ${
                      isPro
                        ? "rounded-[28px] shadow-2xl"
                        : "rounded-2xl shadow-lg"
                    }
                    ${
                      isPro && isExpanded
                        ? "bg-primary  ring-2 ring-primary"
                        : "bg-white text-gray-800 hover:shadow-xl"
                    }`}
                >
                  <div
                    className="flex justify-between items-center p-4 sm:p-6 lg:p-7 min-h-[70px] sm:min-h-[80px] cursor-pointer"
                    onClick={() => handleSelectAndToggleExpand(plan)}
                  >
                    <h3
                      className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                        isPro && isExpanded ? "" : ""
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      {isPro && isExpanded && (
                        <span className="bg-white text-primary text-xs sm:text-sm lg:text-base font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg">
                          Save NGN1,250
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp
                          className={`h-6 w-6 sm:h-7 sm:w-7 ${
                            isPro && isExpanded
                              ? "text-indigo-300"
                              : "text-gray-500"
                          }`}
                        />
                      ) : (
                        <ChevronDown
                          className={`h-6 w-6 sm:h-7 sm:w-7 ${
                            isPro && isExpanded
                              ? "text-indigo-300"
                              : "text-gray-500"
                          }`}
                        />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div
                      className={`p-4 sm:p-6 lg:p-7 border-t ${
                        isPro ? "border-indigo-500" : "border-gray-200"
                      }`}
                    >
                      <p
                        className={`text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 ${
                          isPro ? "text-indigo-100 opacity-95" : "text-gray-600"
                        }`}
                      >
                        {plan.description}
                      </p>
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="flex items-baseline">
                          <span
                            className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${
                              isPro ? "" : ""
                            }`}
                          >
                            {plan.currency}
                            {plan.amount / 100}
                          </span>
                          <span
                            className={`text-base sm:text-lg lg:text-xl font-medium ml-1 ${
                              isPro ? "text-indigo-200" : "text-gray-500"
                            }`}
                          >
                            /{plan.interval === "annually" ? "year" : "month"}
                          </span>
                        </div>
                        <Button
                          onClick={() => handleSubscribe(plan)}
                          disabled={
                            initializeTransactionMutation.isPending &&
                            selectedPlan?.plan_code === plan.plan_code
                          }
                          className={`w-full sm:w-auto text-sm sm:text-base lg:text-lg font-semibold rounded-lg sm:rounded-xl
                            ${
                              isPro
                                ? "bg-[#5D5FEF] hover:bg-[#4A4A7A]  px-6 py-3 sm:px-8 md:px-10 lg:px-12 sm:py-3.5 lg:py-4" // Pro button
                                : "bg-primary hover:bg-[#4338CA]  px-5 py-2.5 sm:px-6 md:px-8 lg:px-10 sm:py-3 lg:py-3.5" // Standard plan button
                            }`}
                        >
                          {initializeTransactionMutation.isPending &&
                          selectedPlan?.plan_code === plan.plan_code
                            ? "Processing..."
                            : "Subscribe"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {displayedPlans.length === 0 && !isLoadingPlans && (
              <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
                <p className="text-gray-600 text-xl">
                  No {isAnnualBilling ? "annual" : "monthly"} plans available at
                  the moment.
                </p>
                <p className="text-base text-gray-400 mt-3">
                  Please check back later or try the other billing cycle.
                </p>
              </div>
            )}

            {initializeTransactionMutation.error && (
              <p className="text-red-600 text-center mt-8 p-5 bg-red-50 rounded-xl border border-red-300 text-base">
                Subscription Error:{" "}
                {initializeTransactionMutation.error.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
