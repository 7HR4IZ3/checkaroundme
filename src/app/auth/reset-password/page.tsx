"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { useAuth } from "@/lib/hooks/useClientAuth";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const userId = params?.get("userId");
  const secret = params?.get("secret");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Assuming a tRPC mutation for password reset confirmation exists
  const resetPassword = trpc.resetPassword.useMutation(); // Placeholder name

  const handlePasswordReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError("");
    setConfirmPasswordError("");

    if (!userId || !secret) {
      toast("Error", { description: "Missing user ID or secret." });
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    try {
      console.log("Resetting password for user:", { userId });
      // Call the reset password mutation
      const result = await resetPassword.mutateAsync({
        userId,
        secret,
        password,
      }); // Placeholder mutation
      console.log("Password reset result:", result);

      if (result.success) {
        // Adjust based on your API response
        toast("Password Reset Successful", {
          description: "You can now login with your new password.",
        });
        router.push("/auth?next=" + window.location.pathname); // Redirect to login page
      } else {
        toast("Reset Failed", {
          description: result.message || "Could not reset password.",
        });
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      // Handle specific errors if needed, similar to login/register
      setPasswordError(error.message || "An unexpected error occurred.");
    }
  };

  return (
    <>
      <div className="text-left mb-12">
        <h1 className="text-3xl font-bold">Reset Your Password</h1>
        <p className="text-muted-foreground mt-2">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handlePasswordReset} className="space-y-4">
        <div>
          <Label htmlFor="password" className="text-muted-foreground text-sm">
            New Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError("");
            }}
            className={`mt-1 ${passwordError ? "border-red-500" : ""}`}
          />
          {passwordError && (
            <p className="text-red-500 text-sm mt-1">{passwordError}</p>
          )}
        </div>

        <div>
          <Label
            htmlFor="confirmPassword"
            className="text-muted-foreground text-sm"
          >
            Confirm New Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setConfirmPasswordError("");
            }}
            className={`mt-1 ${confirmPasswordError ? "border-red-500" : ""}`}
          />
          {confirmPasswordError && (
            <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>
          )}
        </div>

        <Button type="submit" className="w-full mt-6 h-11">
          {resetPassword.isPending ? (
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
            "Reset Password"
          )}
        </Button>
      </form>

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

function ResetPasswordPageInner() {
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
            <ResetPasswordForm />
          </div>
        </div>

        {/* Image container */}
        <div className="hidden md:block md:w-1/2 relative">
          <Image
            className="rounded-xl"
            src="/images/signin-placeholder.jpg" // Consider a different image?
            alt="Password reset illustration" // Update alt text
            style={{ objectFit: "cover" }}
            fill
            priority
          />
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordPageInner />
    </Suspense>
  );
}
