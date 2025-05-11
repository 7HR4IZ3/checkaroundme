import { MailingListService } from "@/lib/appwrite";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address provided." },
        { status: 400 },
      );
    }

    const newEntry = await MailingListService.addEmail(email);
    // The MailingListService.addEmail now returns the existing document if email is already subscribed
    // or throws an error which we might not catch specifically here unless we modify the service.
    // For simplicity, we'll assume a successful call means it's either newly added or was already there.
    // A more robust solution might involve the service throwing a specific error for duplicates.

    // Check if the returned document indicates it was a new entry or an existing one.
    // This depends on how `MailingListService.addEmail` is implemented.
    // If it throws an error for duplicates, that would be caught in the catch block.
    // If it returns the existing document, we can check for that.
    // For now, let's assume a 201 for new and 200 if it already existed (though the service returns the doc).

    // Based on the current implementation of MailingListService.addEmail:
    // It returns the document, new or existing.
    // We can't easily distinguish here if it was newly created or pre-existing without more info from the service call.
    // Let's return a generic success message.
    return NextResponse.json(
      {
        message: "Successfully subscribed to the mailing list.",
        data: { id: newEntry.$id, email: newEntry.email },
      },
      { status: 200 }, // Using 200 as it could be new or existing
    );
  } catch (error: any) {
    console.error("Mailing list subscription error:", error);
    // If MailingListService.addEmail throws a specific error for duplicates, catch it here.
    // Example: if (error.message === "Email already subscribed.") return NextResponse.json({ error: "This email is already subscribed." }, { status: 409 });
    return NextResponse.json(
      { error: "Failed to subscribe to the mailing list. Please try again." },
      { status: 500 },
    );
  }
}
