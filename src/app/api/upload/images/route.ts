import { NextRequest, NextResponse } from "next/server";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { BusinessImagesService } from "@/lib/appwrite/services/business-images";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const userID = formData.get("userID") as string;
  const businessId = formData.get("businessId") as string | null;
  const files = formData.getAll("images") as File[] | null;

  if (!files) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    // Call the tRPC mutation, passing the File object directly
    const result = await BusinessImagesService.uploadTempBusinessImage(
      files,
      userID,
      businessId,
    );
    return NextResponse.json(result);
  } catch (cause) {
    if (cause instanceof TRPCError) {
      // Handle tRPC-specific errors
      const httpCode = getHTTPStatusCodeFromError(cause);
      return NextResponse.json(
        { error: { message: cause.message, code: cause.code } },
        { status: httpCode },
      );
    }
    // Handle other unexpected errors
    console.error("Error uploading image via API route:", cause);
    return NextResponse.json(
      { error: "Internal server error during image upload" },
      { status: 500 },
    );
  }
}
