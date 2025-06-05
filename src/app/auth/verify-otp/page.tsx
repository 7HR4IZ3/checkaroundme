"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { redirect, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Loading from "@/components/ui/loading";
import { useAuth } from "@/lib/hooks/useClientAuth";

export default function VerifyOtpPage() {
  const { user, isAuthenticated } = useAuth();
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const verify2FA = trpc.verify2FA.useMutation();
  const start2FA = trpc.start2FA.useMutation();

  if (!isAuthenticated) return redirect("/auth");

  if (
    !user.prefs.challenge ||
    !user.prefs.twoFactorEnabled ||
    user.prefs.twoFactorVerified
  )
    return redirect("/");

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Input refs will be focused programmatically
  useEffect(() => {
    const input = document.getElementById(`otp-${activeOtpIndex}`);
    if (input) {
      (input as HTMLInputElement).focus();
    }
  }, [activeOtpIndex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const otpString = otp.join("");

    try {
      await verify2FA.mutateAsync({ otp: otpString });
      toast.success("2FA verified successfully!");

      const nextUrl = searchParams?.get("next");
      if (nextUrl && nextUrl.startsWith("/")) {
        window.location.assign(nextUrl);
      } else {
        window.location.assign("/");
      }
    } catch (err: any) {
      setError(err?.message || "Invalid OTP");
      toast.error("Invalid OTP. Please try again.");
      // Clear OTP fields on error
      setOtp(new Array(6).fill(""));
      setActiveOtpIndex(0);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    try {
      await start2FA.mutateAsync({});
      toast.success("New OTP sent to your email.");
      setCountdown(30); // Reset countdown
    } catch (err: any) {
      toast.error("Failed to resend OTP. Please try again later.");
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      setActiveOtpIndex(index + 1);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      // Move to previous input on backspace
      if (!otp[index] && index > 0) {
        setActiveOtpIndex(index - 1);
      }
    }
  };

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
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Please enter the 6-digit code sent to your email
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((_, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[index]}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    handleOtpChange(value, index);
                  }}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 text-center text-lg font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ))}
            </div>

            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  disabled={countdown > 0 || start2FA.isPending}
                  onClick={handleResend}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                </Button>
              </p>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full mt-2"
              disabled={otp.some((digit) => !digit) || verify2FA.isPending}
            >
              {verify2FA.isPending ? <Loading /> : null}
              {verify2FA.isPending ? "Verifying..." : "Verify Code"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
