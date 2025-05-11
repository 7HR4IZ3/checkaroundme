import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";

import Header from "@/components/base/header";
import Footer from "@/components/base/footer";
import AuthProvider from "@/components/auth/provider";
import { TrpcProvider } from "@/lib/trpc/components/provider";
import { GeolocationPermissionProvider } from "@/lib/context/GeolocationPermissionContext";

import "./globals.css";
import { Suspense } from "react";
import Loading from "@/components/ui/loading";
import { Toaster } from "@/components/ui/sonner";
import { SubscriptionBanner } from "@/components/ui/subscription-banner"; // Import the banner
// import { useAuth } from "@/lib/hooks/useClientAuth"; // Import useAuth hook

import { Analytics } from "@vercel/analytics/react";
import { HydrateClient } from "@/lib/trpc/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Checkaroundme - Discover Local Businesses",
  description:
    "Find and connect with amazing local businesses in your community.",
};

// Inner component to access auth context
function LayoutInner({ children }: { children: React.ReactNode }) {
  // const { isAuthenticated, user } = useAuth();

  // Determine if the banner should be shown
  // Show if: user is authenticated AND subscriptionStatus is not 'active'
  // Assumes user prefs have `subscriptionStatus` field. Adjust if named differently.
  const showBanner = false;
  // isAuthenticated &&
  // user?.prefs?.subscriptionStatus !== "active" &&
  // !user?.labels.includes("admin");

  return (
    <GeolocationPermissionProvider>
      {showBanner && <SubscriptionBanner />}
      <Header />
      <main>{children}</main>
      <Toaster />
      <Footer />
    </GeolocationPermissionProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {process.env.NODE_ENV === "development" && (
        <script
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
        />
      )}
      <body className={inter.className}>
        <TrpcProvider>
          <HydrateClient>
            <Suspense fallback={<Loading />}>
              <AuthProvider>
                <LayoutInner>{children}</LayoutInner>
              </AuthProvider>
            </Suspense>
          </HydrateClient>
        </TrpcProvider>
        {process.env.NODE_ENV !== "development" && (
          <Analytics mode="production" />
        )}
      </body>
    </html>
  );
}
