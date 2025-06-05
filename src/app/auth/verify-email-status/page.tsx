"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Loading from "@/components/ui/loading";

export default function VerifyEmailStatusPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams) return;

    const verified = searchParams.get("verified");
    const error = searchParams.get("error");

    if (verified === "true") {
      setStatus("success");
    } else if (verified === "false") {
      setStatus("error");
      setErrorMessage(error || "Email verification failed.");
    } else {
      // Handle cases where parameters are missing or unexpected
      setStatus("error");
      setErrorMessage("Invalid verification link.");
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-4">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={150}
              height={40}
              priority
            />
          </div>
          <CardTitle className="text-2xl font-bold">
            Email Verification Status
          </CardTitle>
          {/* Optional: Add a description if needed */}
          {/* <CardDescription>Checking your verification status...</CardDescription> */}
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          {status === "verifying" && (
            <div className="flex flex-col items-center space-y-4">
              <Loading />
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-green-600 space-y-4">
              <p className="text-lg font-semibold">Your email has been successfully verified!</p>
            </div>
          )}

          {status === "error" && (
            <div className="text-red-600 space-y-4">
              <p className="text-lg font-semibold">Email verification failed.</p>
              {errorMessage && <p className="text-sm text-gray-700">{errorMessage}</p>}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          {status === "success" && (
            <Link href="/" passHref>
              <Button className="w-full max-w-xs">
                Proceed to Homepage
              </Button>
            </Link>
          )}

          {status === "error" && (
            <Link href="/" passHref>
              <Button className="w-full max-w-xs">
                Return to Homepage
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}