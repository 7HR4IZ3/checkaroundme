"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc/client"; // If you need to update user status via tRPC
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/useClientAuth";

export default function PaymentStatusPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return router.push("/auth");
  }

  const searchParams = useSearchParams();
  // Paystack typically uses 'reference' or 'trxref' in the callback
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  // Paystack doesn't usually include a 'status' param in the redirect, verification is needed.

  // State to hold the final status and message derived from query results
  const [displayStatus, setDisplayStatus] = useState<
    "loading" | "success" | "error" | "pending" | "cancelled"
  >("loading");
  const [displayMessage, setDisplayMessage] = useState<string>(
    "Verifying your payment..."
  );
  // Use the combined mutation
  const verifyAndSubscribeMutation =
    trpc.verifyTransactionAndCreateSubscription.useMutation({
      onSuccess: (data) => {
        console.log("Verification and subscription successful:", data);
        setDisplayStatus("success");
        setDisplayMessage(
          data.message || "Payment successful and subscription activated!"
        );
        toast.success("Subscription Activated!");
      },
      onError: (error) => {
        console.error("Verification or subscription creation failed:", error);
        setDisplayStatus("error");
        setDisplayMessage(
          error.message || "An error occurred during payment processing."
        );
        toast.error("Payment Processing Error", { description: error.message });
      },
    });

  // Effect to trigger the mutation when the reference is available
  useEffect(() => {
    if (reference && verifyAndSubscribeMutation.isIdle) {
      console.log(
        `Attempting to verify and subscribe with reference: ${reference}`
      );
      setDisplayStatus("loading");
      setDisplayMessage("Verifying payment and activating subscription...");
      verifyAndSubscribeMutation.mutate({ reference });
    } else if (!reference) {
      // Handle case where reference is missing on initial load
      setDisplayStatus("error");
      setDisplayMessage(
        "Payment verification failed: Missing transaction reference."
      );
    }
    // Intentionally run only once when reference is available or changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]); // Depend only on reference

  const renderContent = () => {
    // Display based on the mutation state
    if (verifyAndSubscribeMutation.isPending || displayStatus === "loading") {
      return <p>{displayMessage}</p>;
    }

    if (verifyAndSubscribeMutation.isError || displayStatus === "error") {
      return (
        <>
          <p className="text-red-600">{displayMessage}</p>
          <Button
            onClick={() => router.push("/business/payment")} // Go back to select plan
            className="mt-4"
          >
            Try Again
          </Button>
          <Link href="/contact-us" passHref className="mt-2">
            <Button variant="link">Contact Support</Button>
          </Link>
        </>
      );
    }

    if (verifyAndSubscribeMutation.isSuccess || displayStatus === "success") {
      switch (displayStatus) {
        case "success":
          return (
            <>
              <p className="text-green-600">{displayMessage}</p>
              <Button
                onClick={() => router.push("/business/create")}
                className="mt-4"
              >
                Continue
              </Button>
            </>
          );
        case "pending": // Paystack verification usually results in success/fail, not pending often
          return (
            <>
              <p className="text-orange-600">{displayMessage}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your payment status is currently pending. Please check back
                later or contact support.
              </p>
              <Button
                onClick={() => router.push("/business/create")}
                className="mt-4"
              >
                Go to Home
              </Button>
            </>
          );
        case "cancelled": // Specific UI for cancelled payments
          return (
            <>
              <p className="text-red-600">{displayMessage}</p>
              <Button
                onClick={() => router.push("/business/payment")} // Go back to select plan
                className="mt-4"
              >
                Try Again
              </Button>
              <Link href="/contact-us" passHref className="mt-2">
                <Button variant="link">Contact Support</Button>
              </Link>
            </>
          );
        default:
          return null;
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Payment Status
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {displayStatus === "pending"
              ? "Please wait..."
              : `Your payment status: ${displayStatus}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">{renderContent()}</CardContent>
      </Card>
    </div>
  );
}
