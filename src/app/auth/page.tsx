// src/components/SignUpForm.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaGoogle } from "react-icons/fa";
import { toast } from "sonner";
import { Star } from "lucide-react";
import {
  GoogleReCaptchaCheckbox,
  GoogleReCaptchaProvider,
} from "@google-recaptcha/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import { useAuth } from "@/lib/hooks/useClientAuth";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function LoginForm({ onToggle }: { onToggle: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const [captchaToken, setCaptchaToken] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(true);

  const login = trpc.login.useMutation();
  const googleLogin = trpc.loginWithGoogle.useMutation();

  const resetCaptcha = () => {
    // @ts-ignore
    window.grecaptcha.reset();
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!captchaToken) {
      return setCaptchaError("Invalid captcha");
    }

    setEmailError("");
    setPasswordError("");

    try {
      console.log("Logging in with:", { email, password });
      const result = await login.mutateAsync({ email, password, captchaToken }); // Added captchaToken
      console.log("Login result:", result);

      if (result.success) {
        const nextUrl = searchParams.get("next");
        if (nextUrl && nextUrl.startsWith("/")) {
          redirect(nextUrl);
        } else {
          redirect("/");
        }
      } else {
        // This block might be reached if the mutation succeeds but the server returns success: false
        // Handle based on your API's specific error structure if different from mutation error
        toast("Login Failed", { description: "An unexpected error occurred." });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.data?.httpStatus === 400) {
        try {
          const errors = JSON.parse(error.message);

          for (const item of errors) {
            if (item.path[0] === "email") {
              setEmailError(item.message);
            } else if (item.path[0] === "password") {
              setPasswordError(item.message);
            }
          }
        } catch {
          setPasswordError(error.message);
        }
      } else {
        setPasswordError(error.message || "An unexpected error occurred.");
      }
      toast.error("Error logging in", {
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      resetCaptcha();
    }
  };

  const handleGoogleSignIn = async () => {
    if (!captchaToken) {
      return setCaptchaError("Invalid captcha");
    }

    try {
      const nextUrl = searchParams.get("next");
      let callbackUrl = window.location.origin + "/api/auth/oauth-callback";
      const queryParams = new URLSearchParams();
      if (nextUrl && nextUrl.startsWith("/")) {
        queryParams.append("next", nextUrl);
      }
      if (queryParams.toString()) {
        callbackUrl += `?${queryParams.toString()}`;
      }
      const url = await googleLogin.mutateAsync({
        redirectUrl: callbackUrl,
        captchaToken,
      });
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
        <p className="text-sm mt-2">Please login to your account</p>
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

        <div>
          <Label htmlFor="password" className="text-muted-foreground text-sm">
            Password
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

        {/* <div className="flex items-center space-x-2 pt-2">
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
                className="text-white hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline"
              >
                Privacy Policy
              </Link>
            </span>
          </Label>
        </div> */}

        <div className="p-3 mt-4 flex flex-col items-center justify-center">
          <GoogleReCaptchaCheckbox onChange={setCaptchaToken} />
          {captchaError && (
            <p className="text-red-500 text-sm mt-1">{captchaError}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full mt-6 h-11"
          disabled={
            !termsAccepted ||
            // !captchaToken ||
            login.isPending ||
            googleLogin.isPending
          }
        >
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
        disabled={
          !termsAccepted ||
          // !captchaToken ||
          login.isPending ||
          googleLogin.isPending
        }
      >
        <FaGoogle />
        <span className="ml-2">Login with Google</span>
      </Button>

      <p className="text-center text-sm text-sm pt-4">
        Forgot your password?{" "}
        <Link
          href="/auth/forgot-password"
          className="font-medium text-white hover:underline"
        >
          Reset Password
        </Link>
      </p>

      <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-sm">
          Or
        </span>
      </div>

      <p className="text-center text-sm text-sm pt-4">
        Don't have an account?{" "}
        <Link
          onClick={onToggle}
          href="#!"
          className="font-medium text-white hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </>
  );
}

function SignUpForm({ onToggle }: { onToggle: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [termsError, setTermsError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const login = trpc.login.useMutation();
  const register = trpc.register.useMutation();
  const googleLogin = trpc.loginWithGoogle.useMutation();

  const resetCaptcha = () => {
    // @ts-ignore
    window.grecaptcha.reset();
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!termsAccepted) {
      setTermsError("Please accept the terms and conditions.");
      return;
    }

    if (!captchaToken) {
      return setCaptchaError("Invalid captcha");
    }
    setFullNameError("");
    setEmailError("");
    setPhoneError("");
    setPasswordError("");
    setTermsError("");

    try {
      const result = await register.mutateAsync({
        name: fullName,
        email,
        password,
        phone,
        captchaToken,
        login: true,
        referralCode: searchParams.get("ref") || undefined,
      });

      if (result.success) {
        const nextUrl = searchParams.get("next");
        if (nextUrl && nextUrl.startsWith("/")) {
          redirect(nextUrl);
        } else {
          redirect("/");
        }
      } else {
        toast.error("Registration Failed", {
          description: "An unexpected error occurred.",
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.data?.httpStatus === 400) {
        try {
          const errors = JSON.parse(error.message);
          for (const error of errors) {
            if (error.path[0] === "name") {
              setFullNameError(error.message);
            }
            if (error.path[0] === "email") {
              setEmailError(error.message);
            }
            if (error.path[0] === "phone") {
              setPhoneError(error.message);
            }
            if (error.path[0] === "password") {
              setPasswordError(error.message);
            }
          }
        } catch {
          setPasswordError(error.message);
        }
      } else {
        toast.error("Registration Error", {
          description: error.message || "An unexpected error occurred.",
        });
      }
    } finally {
      resetCaptcha();
    }
  };

  const handleGoogleSignIn = async () => {
    if (!captchaToken) {
      return setCaptchaError("Invalid captcha");
    }

    try {
      const refCode = searchParams.get("ref");
      const nextUrl = searchParams.get("next");
      let callbackUrl = window.location.origin + "/api/auth/oauth-callback";
      const queryParams = new URLSearchParams();
      if (refCode) {
        queryParams.append("ref", refCode);
      }
      if (nextUrl && nextUrl.startsWith("/")) {
        queryParams.append("next", nextUrl);
      }
      if (queryParams.toString()) {
        callbackUrl += `?${queryParams.toString()}`;
      }
      const url = await googleLogin.mutateAsync({
        redirectUrl: callbackUrl,
        captchaToken,
      });
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
            className={`mt-1 ${fullNameError ? "border-red-500" : ""}`}
          />
          {fullNameError && (
            <p className="text-red-500 text-sm mt-1">{fullNameError}</p>
          )}
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
            className={`mt-1 ${emailError ? "border-red-500" : ""}`}
          />
          {emailError && (
            <p className="text-red-500 text-sm mt-1">{emailError}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone" className="text-muted-foreground text-sm">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+000 000 000 000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`mt-1 ${phoneError ? "border-red-500" : ""}`}
          />
          {phoneError && (
            <p className="text-red-500 text-sm mt-1">{phoneError}</p>
          )}
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
            className={`mt-1 ${passwordError ? "border-red-500" : ""}`}
          />
          {passwordError && (
            <p className="text-red-500 text-sm mt-1">{passwordError}</p>
          )}
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
                className="text-white hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline"
              >
                Privacy Policy
              </Link>
            </span>
          </Label>
        </div>
        {termsError && (
          <p className="text-red-500 text-sm mt-1">{termsError}</p>
        )}

        <div className="p-3 mt-4 flex flex-col items-center justify-center">
          <GoogleReCaptchaCheckbox onChange={setCaptchaToken} />
          {captchaError && (
            <p className="text-red-500 text-sm mt-1">{captchaError}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full mt-6 h-11"
          disabled={
            !termsAccepted ||
            // !captchaToken ||
            login.isPending ||
            googleLogin.isPending ||
            register.isPending
          }
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
        disabled={
          !termsAccepted ||
          // !captchaToken ||
          login.isPending ||
          googleLogin.isPending ||
          register.isPending
        }
      >
        <FaGoogle />
        <span className="ml-2">Register with Google</span>
      </Button>

      <p className="text-center text-sm text-muted-foreground pt-4">
        Already have an account?{" "}
        <Link
          href="#!"
          onClick={onToggle}
          className="font-medium text-white hover:underline"
        >
          Login
        </Link>
      </p>
    </>
  );
}

// Helper component for star ratings (can be simplified for landing page)
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />
      ))}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      ))}
    </div>
  );
};

// New component for displaying landing page reviews
const LandingReviewCard = ({
  review,
}: {
  review: {
    id: string;
    reviewerName: string;
    rating: number;
    comment: string;
    createdAt: Date;
    reviewerImage: string;
  };
}) => {
  // Adjusted styles for LandingReviewCard
  return (
    // Use bg-muted/40 like other cards, adjust padding
    <Card className="border-none shadow-none bg-muted/40 p-4">
      <CardHeader className="p-0 mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={review.reviewerImage} alt={review.reviewerName} />
            <AvatarFallback>
              {review.reviewerName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{review.reviewerName}</p>
            <StarRating rating={review.rating} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-muted-foreground text-sm mb-2">{review.comment}</p>
        <p className="text-xs text-muted-foreground/80">
          {new Date(review.createdAt).toDateString()}
        </p>
      </CardContent>
    </Card>
  );
};

const howItWorksSteps = [
  {
    title: "Step 1: Sign Up",
    description: "Create your account in seconds.",
    icon: "👤",
  },
  {
    title: "Step 2: Find Services",
    description: "Browse local services near you.",
    icon: "🔍",
  },
  {
    title: "Step 3: Connect",
    description: "Connect with businesses instantly.",
    icon: "💬",
  },
];

const reviews = [
  {
    id: "rev1",
    reviewerName: "Alex Johnson",
    rating: 5,
    comment: "Amazing platform! Found exactly what I needed quickly.",
    createdAt: new Date(),
    reviewerImage: "/images/cat-placeholder.png", // Placeholder image
  },
  {
    id: "rev2",
    reviewerName: "Samantha Lee",
    rating: 4,
    comment: "Very helpful service, easy to use interface.",
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    reviewerImage: "/images/cat-placeholder.png", // Placeholder image
  },
  {
    id: "rev3",
    reviewerName: "Mike Brown",
    rating: 5,
    comment: "Highly recommend! Saved me a lot of time.",
    createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
    reviewerImage: "/images/cat-placeholder.png", // Placeholder image
  },
];

const benefits = [
  {
    title: "Easy Discovery",
    description: "Find local services quickly and easily.",
    icon: "✨",
  },
  {
    title: "Connect Directly",
    description:
      "Communicate with service providers directly through the platform.",
    icon: "💬",
  },
  {
    title: "Trusted Reviews",
    description: "Make informed decisions based on real user reviews.",
    icon: "⭐",
  },
];

const faqs = [
  {
    question: "How do I find services?",
    answer: "Use the search bar or browse categories.",
  },
  {
    question: "Is it free to use?",
    answer: "Yes, it's free for users to find and connect with services.",
  },
  {
    question: "How can I list my business?",
    answer: "Sign up as a business and create your profile.",
  },
];

function LandingPage() {
  // Adjusted styles for integration into auth page
  return (
    <div className="flex flex-col h-full text-foreground">
      <main className="flex-grow overflow-y-auto p-4 md:p-8">
        <section className="text-center mb-12">
          <div className="relative z-10">
            <div className="flex flex-row justify-center align-center">
              <Link href="/">
                <Image
                  src="/images/logo.png"
                  alt="Checkaroundme"
                  width={200}
                  height={40}
                />
              </Link>
            </div>
            <p className="text-md md:text-lg mb-6 max-w-xl mx-auto text-muted-foreground">
              Discover and connect with the best local services right in your
              neighborhood. Fast, easy, and reliable.
            </p>
          </div>
        </section>

        <section id="benefits" className="py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-3">Why Choose Us?</h2>
            <p className="text-md text-muted-foreground mb-10 max-w-xl mx-auto">
              Discover the advantages of using our platform.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  className="text-center bg-muted/40 shadow-none border-none"
                >
                  <CardHeader className="pb-3 pt-4">
                    <div className="text-4xl mb-3">{benefit.icon}</div>
                    <CardTitle className="text-xl font-semibold">
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-muted-foreground text-sm">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p className="text-md text-muted-foreground mb-10 max-w-xl mx-auto">
              Get started in just a few simple steps.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {howItWorksSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-4 rounded-lg bg-muted/40"
                >
                  <div className="text-4xl mb-3 p-3 bg-primary/10 rounded-full text-white">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="reviews" className="py-12">
          <div>
            <h2 className="text-2xl font-bold text-center mb-3">
              What Our Users Say
            </h2>
            <p className="text-md text-muted-foreground text-center mb-10 max-w-xl mx-auto">
              Real feedback from our community.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <LandingReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-12">
          <div>
            <h2 className="text-2xl font-bold text-center mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-md text-muted-foreground text-center mb-10 max-w-xl mx-auto">
              Find answers to common questions.
            </p>
            <div className="grid gap-6 max-w-2xl mx-auto">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-1">{faq.question}</h3>
                  <p className="text-muted-foreground text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
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
      <div className="flex flex-row h-[80vh]">
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16">
          <div className="space-y-6">
            <GoogleReCaptchaProvider
              type="v2-checkbox"
              siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            >
              {isLogin ? (
                <LoginForm onToggle={() => setIsLogin(false)} />
              ) : (
                <SignUpForm onToggle={() => setIsLogin(true)} />
              )}
            </GoogleReCaptchaProvider>
          </div>
        </div>

        <div className="hidden md:block md:w-1/2 relative">
          {isLogin ? (
            <Image
              className="rounded-xl"
              src="/images/signin-placeholder.jpg"
              alt="Mechanic working on car engine"
              style={{ objectFit: "cover" }}
              fill
              priority
            />
          ) : (
            <div className="overflow-y h-full">
              <LandingPage />
            </div>
          )}
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
