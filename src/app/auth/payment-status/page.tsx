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

export default function PaymentStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transaction_id = searchParams.get("transaction_id");
  const tx_ref = searchParams.get("tx_ref");
  const paymentStatusParam = searchParams.get("status");

  // Determine the ID to use for verification (prefer transaction_id)
  const idToVerify = transaction_id || tx_ref; // Note: verifyTransaction expects numeric ID

  // State to hold the final status and message derived from query results
  const [displayStatus, setDisplayStatus] = useState<
    "loading" | "success" | "error" | "pending" | "cancelled"
  >("loading");
  const [displayMessage, setDisplayMessage] = useState<string>(
    "Verifying your payment..."
  );

  // tRPC query for verification
  const {
    data: verificationData,
    isLoading,
    isError,
    error,
  } = trpc.verifyTransaction.useQuery(
    { transactionId: Number(idToVerify) }, // Ensure ID is a number if possible
    {
      enabled: !!idToVerify && paymentStatusParam !== "cancelled", // Only run if we have an ID and wasn't cancelled
      refetchOnWindowFocus: false,
      retry: false, // Don't retry automatically on error
    }
  );

  // Example tRPC mutation (keep for later implementation)
  // const updateUserSubscription = trpc.updateUserSubscriptionStatus.useMutation();

  // Effect to update display based on query parameters and tRPC results
  useEffect(() => {
    if (paymentStatusParam === "cancelled") {
      setDisplayStatus("cancelled"); // Use a specific status for cancelled
      setDisplayMessage(
        "Payment was cancelled. You can try subscribing again."
      );
      return;
    }

    if (!idToVerify) {
      setDisplayStatus("error");
      setDisplayMessage(
        "Payment verification failed: Missing transaction reference."
      );
      return;
    }

    // Note: The check for tx_ref without transaction_id needs careful handling.
    // If verifyTransaction strictly needs the numeric ID, this query might fail if only tx_ref is provided.
    // The error handling below will catch this. Consider adding specific logic if tx_ref verification is needed differently.
    if (!transaction_id && tx_ref) {
      console.warn(
        "Attempting verification using tx_ref as transaction ID. This might fail if Flutterwave requires the numeric ID for this endpoint."
      );
      // If the query below fails due to this, the error state will be handled.
    }

    if (isLoading) {
      setDisplayStatus("loading");
      setDisplayMessage("Verifying your payment...");
    } else if (isError) {
      setDisplayStatus("error");
      setDisplayMessage(
        error?.message || "An error occurred during payment verification."
      );
    } else if (verificationData) {
      // Process successful verification data
      const paymentData = verificationData; // Already typed from query
      if (paymentData.status === "successful") {
        setDisplayStatus("success");
        setDisplayMessage(
          `Payment successful! Your subscription for ${paymentData.amount} ${paymentData.currency} is now active.`
        );
        // TODO: Trigger database update here
        // Example:
        // updateUserSubscription.mutate({ ... });
      } else if (paymentData.status === "pending") {
        setDisplayStatus("pending");
        setDisplayMessage(
          `Payment is pending. We will update your status once confirmed. Transaction reference: ${paymentData.tx_ref}`
        );
      } else {
        setDisplayStatus("error");
        setDisplayMessage(
          `Payment failed or was not successful. Status: ${
            paymentData.status
          }. ${paymentData.processor_response || ""}`
        );
      }
    } else {
      // Handle case where query finished without error but no data (should not happen with proper error handling in router)
      setDisplayStatus("error");
      setDisplayMessage(
        "Verification completed with unexpected results. Please contact support."
      );
    }
  }, [
    paymentStatusParam,
    idToVerify,
    transaction_id,
    tx_ref,
    isLoading,
    isError,
    error,
    verificationData,
  ]);

  const renderContent = () => {
    switch (displayStatus) {
      case "loading":
        return <p>{displayMessage}</p>; // Show loading message
      case "success":
        return (
          <>
            <p className="text-green-600">{displayMessage}</p>
            <Button onClick={() => router.push("/")} className="mt-4">
              Go to Homepage
            </Button>
          </>
        );
      case "pending":
        return (
          <>
            <p className="text-orange-600">{displayMessage}</p>
            <p className="text-sm text-muted-foreground mt-2">
              You can close this page. Your subscription will be updated
              automatically once the payment is confirmed. Check your dashboard
              later.
            </p>
            <Button onClick={() => router.push("/")} className="mt-4">
              Go to Home
            </Button>
          </>
        );
      case "error": // Covers general errors and specific failed statuses
      case "cancelled": // Specific UI for cancelled payments
        return (
          <>
            <p className="text-red-600">{displayMessage}</p>
            <Button
              onClick={() => router.push("/auth/onboarding")} // Go back to select plan
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
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Payment Status
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {displayStatus === "loading"
              ? "Please wait..."
              : `Your payment status: ${displayStatus}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">{renderContent()}</CardContent>
      </Card>
    </div>
  );
}
