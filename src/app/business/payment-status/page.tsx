"use client";

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
import { useAuth } from "@/lib/hooks/useClientAuth";
import { useEffect, useState } from "react";
import Loading from "@/components/ui/loading";

export default function PaymentStatusPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return router.push("/auth");
  }

  const searchParams = useSearchParams();

  const renderContent = () => {
    if (!searchParams) return <Loading />;
    if (
      user.prefs.subscriptionStatus === "active"
    ) {
      return (
        <>
          <p className="text-green-600">
            Payment successful and subscription activated!
          </p>
          {user.prefs ? (
            <div className="mt-4 text-center">
              <div>
                <span className="font-semibold">Subscription Status:</span>{" "}
                <span className="capitalize">
                  {user.prefs.subscriptionStatus || "unknown"}
                </span>
              </div>
              {user.prefs.subscriptionExpiry ? (
                <div>
                  <span className="font-semibold">Expiry Date:</span>{" "}
                  <span>
                    {new Date(
                      user.prefs.subscriptionExpiry
                    ).toLocaleDateString()}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}
          <Button
            onClick={() => router.push("/business/create")}
            className="mt-4"
          >
            Continue
          </Button>
        </>
      );
    } else {
      return (
        <>
          <p className="text-red-600">
            {searchParams.has("error")
              ? `Payment failed: ${decodeURIComponent(
                  searchParams.get("error")!
                )}`
              : "You don't have an active subsciption"}
          </p>
          <Button
            onClick={() => router.push("/business/payment")}
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
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Payment Status
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Your payment status: {user.prefs.subscriptionStatus || "inactive"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">{renderContent()}</CardContent>
      </Card>
    </div>
  );
}
