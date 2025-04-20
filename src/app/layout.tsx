import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";

import Header from "@/components/base/header";
import Footer from "@/components/base/footer";
import AuthProvider from "@/components/auth/provider";
import { TrpcProvider } from "@/lib/trpc/provider";

import "./globals.css";
import { Suspense } from "react";
import Loading from "@/components/ui/loading";

import { Analytics } from "@vercel/analytics/react";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TrpcProvider>
          <AuthProvider>
            <Suspense fallback={<Loading />}>
              <Header />
              <main>{children}</main>
              <Footer />
            </Suspense>
          </AuthProvider>
        </TrpcProvider>
        <Analytics mode="production" />
      </body>
    </html>
  );
}
