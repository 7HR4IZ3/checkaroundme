import { AuthService } from "@/lib/appwrite/services/auth";
import { NextResponse } from "next/server"; // Use NextResponse for Next.js 13+ API routes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  if (!userId || !secret) {
    return NextResponse.json(
      { success: false, message: "Missing parameters" },
      { status: 400 }
    );
  }

  try {
    const auth = await AuthService.getCurrentUserWithAcount();
    if (!auth?.user)
      return NextResponse.json(
        { success: false, message: "Unauthorized Request" },
        { status: 401 }
      );

    await auth.account.updateVerification(userId, secret);
    // Redirect to a success page after successful verification
    return NextResponse.redirect(
      new URL("/auth/verify-email-status?verified=true", request.url)
    );
  } catch (error: any) {
    console.error("Email verification failed:", error);
    // Redirect to a failure page or show an error message
    return NextResponse.redirect(
      new URL(
        `/auth/verify-email-status?verified=false&error=${encodeURIComponent(
          error.message || "Failed to verify email."
        )}`,
        request.url
      )
    );
  }
}
