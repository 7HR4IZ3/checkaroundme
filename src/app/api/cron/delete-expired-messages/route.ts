import { NextResponse } from "next/server";
import { MessageService } from "@/lib/appwrite"; // Assuming MessageService is exported from here

// It's a good practice to secure this endpoint, e.g., with a secret key
// that the cron job provider must send in a header or query parameter.
// For example:
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Cron job: Starting deletion of expired messages...");
    const { totalDeletedCount } = await MessageService.deleteExpiredMessages();
    console.log(
      `Cron job: Successfully deleted ${totalDeletedCount} expired messages.`
    );
    return NextResponse.json({
      message: `Successfully deleted ${totalDeletedCount} expired messages.`,
      deletedCount: totalDeletedCount,
    });
  } catch (error) {
    console.error("Cron job: Error deleting expired messages:", error);
    return NextResponse.json(
      {
        error: "Failed to delete expired messages.",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
