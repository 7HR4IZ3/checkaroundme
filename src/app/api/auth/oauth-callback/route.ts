import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService } from "@/lib/appwrite";

// Handles the redirect from Appwrite after Google OAuth
export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  const failure = url.searchParams.get("failure");
  if (failure) {
    // Handle failure case, redirect to login with failure
    return NextResponse.redirect("/auth?failure=true");
  }

  const secret = url.searchParams.get("secret");
  const userId = url.searchParams.get("userId");

  if (!secret || !userId) {
    // Missing required params, redirect to login with failure
    return NextResponse.redirect("/auth?failure=true");
  }

  // Redirect to home page and set the session cookie
  const response = NextResponse.redirect(new URL("/", req.url));

  await AuthService.completeOauth2Login(userId, secret);

  return response;
}
