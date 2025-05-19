import { NextRequest, NextResponse } from "next/server";
import { AnonymousSubmissionService } from "@/lib/appwrite"; // Import the service

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    // Use the Appwrite service to upload the file
    const fileId =
      await AnonymousSubmissionService.uploadAnonymousSubmissionFile(file);
    return NextResponse.json({ fileId });
  } catch (error: any) {
    console.error("Error uploading anonymous submission file:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error during file upload" },
      { status: 500 }
    );
  }
}
