import { NextRequest, NextResponse } from "next/server";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { UserService } from "@/lib/appwrite"; // Assuming UserService is exported from the main appwrite index

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const userId = formData.get("userId") as string | null;
  const file = formData.get("avatar") as File | null; // Assuming the file input name is 'avatar'

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Basic validation for file type and size (can be more robust)
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Invalid file type. Only images are allowed." },
      { status: 400 }
    );
  }
  if (file.size > 5 * 1024 * 1024) {
    // 5MB limit
    return NextResponse.json(
      { error: "File is too large. Maximum size is 5MB." },
      { status: 400 }
    );
  }

  try {
    // Call the Appwrite service function directly
    // Ensure UserService.uploadAvatar is adapted to take File and userId
    // and returns the URL or necessary data.
    const avatarUrl = await UserService.uploadAvatar(file, userId);

    return NextResponse.json({ avatarUrl });
  } catch (cause: any) {
    // Log the detailed error for server-side debugging
    console.error("Error uploading avatar via API route:", cause);

    // Handle Appwrite or other specific errors if possible, otherwise generic
    if (cause instanceof TRPCError) {
      // Though we are not in tRPC context, Appwrite might throw similar
      const httpCode = getHTTPStatusCodeFromError(cause);
      return NextResponse.json(
        { error: { message: cause.message, code: cause.code } },
        { status: httpCode }
      );
    }
    // Check for Appwrite specific exception structure if not TRPCError
    if (cause.code && cause.message && typeof cause.code === "number") {
      return NextResponse.json(
        { error: { message: cause.message, code: cause.code } },
        { status: cause.code >= 400 && cause.code < 600 ? cause.code : 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error during avatar upload",
        details: cause.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
