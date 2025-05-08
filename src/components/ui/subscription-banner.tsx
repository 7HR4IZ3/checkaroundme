"use client";

import Link from "next/link";
import { Button } from "./button";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export function SubscriptionBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 w-full bg-yellow-100 border-b border-yellow-300 p-3 text-yellow-900">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            You are currently not subscribed.{" "}
            <Link
              href="/auth/onboarding"
              className="font-semibold underline hover:text-yellow-800"
            >
              Subscribe now
            </Link>{" "}
            to unlock all features.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-yellow-900 hover:bg-yellow-200 hover:text-yellow-900 p-1 h-auto"
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss subscription banner"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
