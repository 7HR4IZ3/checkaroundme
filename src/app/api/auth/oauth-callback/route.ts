import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Handles the redirect from Appwrite after Google OAuth
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  const userId = url.searchParams.get("userId");

  if (!secret || !userId) {
    // Missing required params, redirect to login with failure
    return NextResponse.redirect("/auth?failure=true");
  }

  // Redirect to home page and set the session cookie
  const response = NextResponse.redirect(new URL("/", req.url));

  await cookies().then((cookies) =>
    cookies.set("cham_appwrite_session", secret, {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })
  );

  return response;
}
