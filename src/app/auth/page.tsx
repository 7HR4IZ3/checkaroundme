// src/components/SignUpForm.tsx
"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaGoogle } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import { useAuth } from "@/lib/hooks/useClientAuth";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

function LoginForm({ onToggle }: { onToggle: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(true);

  const login = trpc.login.useMutation();
  const googleLogin = trpc.loginWithGoogle.useMutation();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    console.log("Logging in with:", { email, password });
    const result = await login.mutateAsync({ email, password });
    if (result.success) {
      if (document.cookie.includes("cham_appwrite_session")) {
        console.log("Session cookie found in browser");
      } else {
        console.log("Session cookie not found in browser");
      }
      router.push("/");
    } else {
      // ... error handling
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const redirectUrl = window.location.origin + "/api/auth/oauth-callback";
      const url = await googleLogin.mutateAsync({ redirectUrl });
      window.location.href = url;
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert("Failed to initiate Google sign-in.");
    }
  };

  return (
    <>
      <div className="text-left mb-12">
        <h1 className="text-3xl font-bold">Welcome Back! 👋</h1>
        <p className="text-muted-foreground mt-2">
          Please login to your account
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-muted-foreground text-sm">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="password" className="text-muted-foreground text-sm">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          />
          <Label
            htmlFor="terms"
            className="flex flex-row flex-rap text-sm text-muted-foreground font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 "
          >
            <span>
              I agree to the{" "}
              <Link
                href="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Privacy Policy
              </Link>
            </span>
          </Label>
        </div>

        <Button type="submit" className="w-full mt-6 h-11">
          {login.isPending ? (
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
            "Login"
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
          Or
        </span>
      </div>

      <Button
        variant="outline"
        className="w-full h-11 bg-black text-white hover:bg-gray-800 hover:text-white"
        onClick={handleGoogleSignIn}
      >
        <FaGoogle />
        <span className="ml-2">Login with Google</span>
      </Button>

      <p className="text-center text-sm text-muted-foreground pt-4">
        Don't have an account?{" "}
        <Link
          onClick={onToggle}
          href="#!"
          className="font-medium text-primary hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </>
  );
}

function SignUpForm({ onToggle }: { onToggle: () => void }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+44 65762354");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);

  const login = trpc.login.useMutation();
  const register = trpc.register.useMutation();
  const googleLogin = trpc.loginWithGoogle.useMutation();

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Registering with:", {
      fullName,
      email,
      phone,
      password,
      termsAccepted,
    });
    if (!termsAccepted) {
      alert("Please accept the terms and conditions.");
      return;
    }
    try {
      await register.mutateAsync({
        name: fullName,
        email,
        password,
        phone,
      });

      // Login user
      console.log("Logging in with:", { email, password });
      const result = await login.mutateAsync({ email, password });
      if (result.success) {
        if (document.cookie.includes("cham_appwrite_session")) {
          console.log("Session cookie found in browser");
        } else {
          console.log("Session cookie not found in browser");
        }
        router.push("/");
      } else {
        // ... error handling
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      alert(error?.message || "Registration failed.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const redirectUrl = window.location.origin + "/api/auth/oauth-callback";
      const url = await googleLogin.mutateAsync({ redirectUrl });
      window.location.href = url;
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert("Failed to initiate Google sign-in.");
    }
  };

  return (
    <>
      <div className="text-left mb-12">
        <h1 className="text-3xl font-bold">Welcome! 👋</h1>
        <p className="text-muted-foreground mt-2">
          Kindly fill in your details below to create an account
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <Label htmlFor="fullName" className="text-muted-foreground text-sm">
            Full Name
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-muted-foreground text-sm">
            Email Address*
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-muted-foreground text-sm">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+44 123 456 7890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="password" className="text-muted-foreground text-sm">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          />
          <Label
            htmlFor="terms"
            className="text-sm text-muted-foreground font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            <span>
              I agree to the{" "}
              <Link
                href="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Privacy Policy
              </Link>
            </span>
          </Label>
        </div>

        <div className="border rounded-md p-3 mt-4 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-2">
            <Checkbox id="recaptcha" disabled checked={isRecaptchaVerified} />
            <Label htmlFor="recaptcha" className="text-sm font-normal">
              I'm not a robot
            </Label>
          </div>
          <div className="text-center">
            <svg
              className="inline-block h-8 w-8 text-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path>
            </svg>
            <p className="text-[10px] text-muted-foreground leading-tight">
              reCAPTCHA
            </p>
            <p className="text-[8px] text-muted-foreground leading-tight">
              Privacy - Terms
            </p>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-6 h-11"
          disabled={!termsAccepted}
        >
          {register.isPending || login.isPending ? (
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
            "Register Account"
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
          Or
        </span>
      </div>

      <Button
        variant="outline"
        className="w-full h-11 bg-black text-white hover:bg-gray-800 hover:text-white"
        onClick={handleGoogleSignIn}
      >
        <FaGoogle />
        <span className="ml-2">Register with Google</span>
      </Button>

      <p className="text-center text-sm text-muted-foreground pt-4">
        Already have an account?{" "}
        <Link
          href="#!"
          onClick={onToggle}
          className="font-medium text-primary hover:underline"
        >
          Login
        </Link>
      </p>
    </>
  );
}

function AuthPageInner() {
  const auth = useAuth();
  const params = useSearchParams();
  const [isLogin, setIsLogin] = useState(!params.has("signup"));

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
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 h-[80vh]">
          <div className="w-full max-w-md space-y-6">
            {isLogin ? (
              <LoginForm onToggle={() => setIsLogin(false)} />
            ) : (
              <SignUpForm onToggle={() => setIsLogin(true)} />
            )}
          </div>
        </div>

        <div className="hidden md:block md:w-1/2 relative">
          <Image
            className="rounded-xl"
            src="/images/signin-placeholder.jpg"
            alt="Mechanic working on car engine"
            style={{ objectFit: "cover" }}
            fill
            priority
          />
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageInner />
    </Suspense>
  );
}
