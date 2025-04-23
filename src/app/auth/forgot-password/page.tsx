// src/app/auth/forgot-password/page.tsx
"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator"; // Keep separator if needed for layout

import { useAuth } from "@/lib/hooks/useClientAuth";
import { redirect, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

// Renamed from LoginForm to ForgotPasswordForm
function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // Assuming a tRPC mutation for password reset exists
  const forgotPassword = trpc.requestPasswordReset.useMutation(); // Placeholder name

  const handlePasswordResetRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setEmailError("");

    try {
      console.log("Requesting password reset for:", { email });
      // Call the forgot password mutation
      const result = await forgotPassword.mutateAsync({ email });
      console.log("Password reset request result:", result);

      if (result.success) { // Adjust based on your API response
        toast("Password Reset Email Sent", {
          description: "Please check your email for instructions.",
        });
        // Optionally redirect or show a success message state
        // router.push('/auth'); // Example redirect
      } else {
        toast("Request Failed", { description: result.message || "Could not send reset email." });
      }
    } catch (error: any) {
      console.error("Password reset request error:", error);
      if (error.data?.httpStatus === 400) {
        // Handle validation errors specifically for email if needed
         const errors = JSON.parse(error.message);
         for (const item of errors) {
           if (item.path[0] === "email") {
             setEmailError(item.message);
             break; // Assuming only one email error
           }
         }
         // If no specific email error, show a generic one
         if (!emailError) {
            setEmailError(error.message || "An unexpected error occurred.");
         }
      } else {
        setEmailError(error.message || "An unexpected error occurred.");
      }
    }
  };

  return (
    <>
      <div className="text-left mb-12">
        <h1 className="text-3xl font-bold">Forgot Your Password?</h1>
        <p className="text-muted-foreground mt-2">
          Enter your email address below and we'll send you a link to reset it.
        </p>
      </div>

      <form onSubmit={handlePasswordResetRequest} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-muted-foreground text-sm">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            className={`mt-1 ${emailError ? "border-red-500" : ""}`}
          />
          {emailError && (
            <p className="text-red-500 text-sm mt-1">{emailError}</p>
          )}
        </div>

        {/* Removed Password field, Terms checkbox, Google Sign in, Separator */}

        <Button type="submit" className="w-full mt-6 h-11">
          {forgotPassword.isPending ? (
            <svg
              className="animate-spin h-8 w-8 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      {/* Removed OR separator and Google Sign in button */}

      <p className="text-center text-sm text-muted-foreground pt-4">
        Remember your password?{" "}
        <Link
          href="/auth" // Link back to the main login page
          className="font-medium text-primary hover:underline"
        >
          Login
        </Link>
      </p>
    </>
  );
}

// Simplified AuthPageInner to only show ForgotPasswordForm
function ForgotPasswordPageInner() {
  const auth = useAuth();

  // Redirect if already logged in
  if (auth.isAuthenticated) return redirect("/");

  return (
    <div className="flex flex-col p-8 gap-6 bg-background">
      <div className="my-auto">
        <Link href="/">
          <Image
            src="/images/logo.png"
            alt="Checkaroundme"
            width={200}
            height={40}
          />
        </Link>
      </div>
      <div className="flex flex-col md:flex-row">
        {/* Form container */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 h-[80vh]">
          <div className="w-full max-w-md space-y-6">
             <ForgotPasswordForm />
          </div>
        </div>

        {/* Image container */}
        <div className="hidden md:block md:w-1/2 relative">
          <Image
            className="rounded-xl"
            src="/images/signin-placeholder.jpg" // Consider a different image?
            alt="Forgot password illustration" // Update alt text
            style={{ objectFit: "cover" }}
            fill
            priority
          />
        </div>
      </div>
    </div>
  );
}

// Renamed default export
export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordPageInner />
    </Suspense>
  );
}