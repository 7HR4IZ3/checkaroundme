import { NextRequest, NextResponse } from "next/server";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { BlogService } from "@/lib/appwrite";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const imageUrl = await BlogService.uploadImage(file);
    return NextResponse.json({ url: imageUrl });
  } catch (cause) {
    if (cause instanceof TRPCError) {
      const httpCode = getHTTPStatusCodeFromError(cause);
      return NextResponse.json(
        { error: { message: cause.message, code: cause.code } },
        { status: httpCode }
      );
    }
    console.error("Error uploading blog image:", cause);
    return NextResponse.json(
      { error: "Internal server error during image upload" },
      { status: 500 }
    );
  }
}
