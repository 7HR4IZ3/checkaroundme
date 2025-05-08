import { NextRequest, NextResponse } from "next/server";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { VerificationService } from "@/lib/appwrite/services/verification";
import { AuthService } from "@/lib/appwrite/services/auth"; // Import AuthService

export async function POST(req: NextRequest) {
  try {
    // 1. Check Authentication using AuthService
    const authResult = await AuthService.getCurrentUser();
    if (!authResult?.user) {
      // Check if user object exists in the result
      return NextResponse.json(
        { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
        { status: 401 },
      );
    }
    const userId = authResult.user.$id; // Get user ID from the authenticated user object

    // 2. Parse FormData
    const formData = await req.formData();
    const businessId = formData.get("businessId") as string | null;
    const file = formData.get("verificationDocument") as File | null; // Ensure frontend sends with this key

    // 3. Validate Input
    if (!file) {
      return NextResponse.json(
        { error: "No verification document file uploaded" },
        { status: 400 },
      );
    }
    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 },
      );
    }

    // Optional: Add checks for file type, size, etc. here

    // 4. Upload File using VerificationService
    // Note: We pass userId for potential logging or permissions in the service
    const fileId = await VerificationService.uploadVerificationDocument(
      file,
      userId,
    );

    // 5. Return the File ID
    return NextResponse.json({ fileId });
  } catch (cause) {
    // Handle potential errors (including TRPCError if service throws it, though less likely here)
    if (cause instanceof TRPCError) {
      const httpCode = getHTTPStatusCodeFromError(cause);
      return NextResponse.json(
        { error: { message: cause.message, code: cause.code } },
        { status: httpCode },
      );
    }
    // Handle errors from VerificationService or other issues
    if (cause instanceof Error) {
      console.error(
        "Error uploading verification document via API route:",
        cause,
      );
      return NextResponse.json(
        {
          error:
            cause.message || "Internal server error during document upload",
        },
        { status: 500 },
      );
    }
    // Fallback for unknown errors
    console.error("Unknown error uploading verification document:", cause);
    return NextResponse.json(
      { error: "Internal server error during document upload" },
      { status: 500 },
    );
  }
}
