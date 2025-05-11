import { MailingListService } from "@/lib/appwrite";
import { NextRequest, NextResponse } from "next/server";

const ACCESS_PASSWORD = process.env.MAILING_LIST_ACCESS_PASSWORD;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");

    if (!ACCESS_PASSWORD) {
      console.error(
        "MAILING_LIST_ACCESS_PASSWORD is not set in environment variables.",
      );
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 },
      );
    }

    if (password !== ACCESS_PASSWORD) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing password." },
        { status: 401 },
      );
    }

    const emails = await MailingListService.getAllEmails();
    const emailAddresses = emails.map((doc) => doc.email);

    return NextResponse.json(emailAddresses, { status: 200 });
  } catch (error: any) {
    console.error("Get mailing list emails error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve mailing list emails." },
      { status: 500 },
    );
  }
}
