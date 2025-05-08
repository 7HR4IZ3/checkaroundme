import { users } from "..";

/**
 * Updates a user's subscription details in the Appwrite database.
 * Uses the Admin client for server-side updates.
 *
 * @param userId - The ID of the user to update.
 * @param subscriptionData - The subscription data to set.
 */
export const updateUserSubscriptionStatus = async (
  userId: string,
  subscriptionData: {
    subscriptionStatus: "active" | "inactive" | "cancelled"; // Define possible statuses
    planCode: string;
    subscriptionExpiry: Date;
    paystackCustomerId?: string;
    paystackSubscriptionCode?: string | null; // Make explicitly optional or nullable
    // Add any other relevant fields you store
  }
) => {
  console.log(`Updating subscription for user ${userId}:`, subscriptionData);
  try {
    // Ensure Date is in ISO format for Appwrite
    const dataToUpdate = {
      ...subscriptionData,
      subscriptionExpiry: subscriptionData.subscriptionExpiry.toISOString(),
    };

    // Filter out undefined/null values before sending to Appwrite if necessary
    const filteredData = Object.fromEntries(
      Object.entries(dataToUpdate).filter(([_, v]) => v != null)
    );

    const updatedUser = await users.updatePrefs(userId, filteredData);

    // Appwrite's updatePrefs returns an empty object on success by default with REST,
    // but node-appwrite might return the user object. Let's log for confirmation.
    console.log(`Successfully updated subscription prefs for user ${userId}`);
    return updatedUser; // Or return a simple success indicator
  } catch (error: any) {
    console.error(
      `Failed to update subscription status for user ${userId}:`,
      error
    );
    // Check for specific Appwrite errors if needed
    if (error.response) {
      console.error("Appwrite error response:", error.response);
    }
    throw new Error(`Failed to update user subscription: ${error.message}`);
  }
};

// --- Add other user service functions below if this file is new ---
// e.g., getUserById, createUser, etc.
