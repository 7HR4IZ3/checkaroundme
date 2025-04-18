import { NextRequest, NextResponse } from "next/server";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { BusinessImagesService } from "@/lib/appwrite";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const userID = formData.get("userID") as string;
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    // Call the tRPC mutation, passing the File object directly
    const result = await BusinessImagesService.uploadTempBusinessImage(file, userID);
    return NextResponse.json(result);
  } catch (cause) {
    if (cause instanceof TRPCError) {
      // Handle tRPC-specific errors
      const httpCode = getHTTPStatusCodeFromError(cause);
      return NextResponse.json(
        { error: { message: cause.message, code: cause.code } },
        { status: httpCode }
      );
    }
    // Handle other unexpected errors
    console.error("Error uploading image via API route:", cause);
    return NextResponse.json(
      { error: "Internal server error during image upload" },
      { status: 500 }
    );
  }
}