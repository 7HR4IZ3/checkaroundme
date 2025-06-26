import "dotenv/config";
import { Client, Databases, Query, Users, Models } from "node-appwrite";
import { getPaystackInstance } from "../src/lib/paystack";

// Appwrite configuration
const client = new Client();

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const users = new Users(client);
const databases = new Databases(client);

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const BUSINESSES_COLLECTION_ID = "businesses";
const PAYMENT_TRANSACTIONS_COLLECTION_ID = "payment_transactions";

interface UserEmail {
  id: string;
  email: string;
}

/**
 * Fetches all user IDs and emails from Appwrite.
 * @returns A promise that resolves to an array of objects, each containing a user's ID and email.
 */
async function getAllUsersEmails(): Promise<UserEmail[]> {
  const allUsers: UserEmail[] = [];
  let hasMore = true;
  let cursor: string | undefined = undefined;
  const limit = 1000; // Max limit for listUsers

  try {
    while (hasMore) {
      const queries = [Query.limit(limit)];
      if (cursor) {
        queries.push(Query.cursorAfter(cursor));
      }

      const response = await users.list(queries);

      response.users.forEach((user) => {
        if (user.email) {
          allUsers.push({ id: user.$id, email: user.email });
        }
      });

      if (response.users.length < limit) {
        hasMore = false;
      } else {
        cursor = response.users[response.users.length - 1].$id;
      }
    }
    console.log(`Fetched ${allUsers.length} user emails.`);
    return allUsers;
  } catch (error) {
    console.error("Error fetching all user emails:", error);
    throw error;
  }
}

/**
 * Fetches emails of all business owners.
 * @returns A promise that resolves to an array of unique email strings of business owners.
 */
async function getBusinessOwnerEmails(): Promise<string[]> {
  const businessOwnerEmails: Set<string> = new Set();
  let hasMoreBusinesses = true;
  let offset = 0;
  const limit = 1000; // Max limit for listDocuments

  try {
    while (hasMoreBusinesses) {
      const businessesResult = await databases.listDocuments(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        [Query.limit(limit), Query.offset(offset)]
      );

      for (const business of businessesResult.documents) {
        if (business.ownerId) {
          try {
            const user = await users.get(business.ownerId);
            if (user.email) {
              businessOwnerEmails.add(user.email);
            }
          } catch (userError) {
            console.warn(
              `Could not fetch user ${business.ownerId}:`,
              userError
            );
          }
        }
      }

      if (businessesResult.documents.length < limit) {
        hasMoreBusinesses = false;
      } else {
        offset += limit;
      }
    }
    console.log(
      `Fetched ${businessOwnerEmails.size} unique business owner emails.`
    );
    return Array.from(businessOwnerEmails);
  } catch (error) {
    console.error("Error fetching business owner emails:", error);
    throw error;
  }
}

/**
 * Fetches emails of all users who have made a successful transaction.
 * @returns A promise that resolves to an array of unique email strings of transaction makers.
 */
async function getTransactionMakerEmails(): Promise<string[]> {
  const transactionEmails: Set<string> = new Set();
  let page = 1;
  let hasMore = true;
  const perPage = 100; // Max limit for Paystack listTransactions

  try {
    const ps = getPaystackInstance();
    while (hasMore) {
      const transactionsResult = await ps.transaction.list({
        page,
        perPage,
        status: "success",
      });

      transactionsResult.data?.forEach((transaction: any) => {
        if (transaction.customer && transaction.customer.email) {
          transactionEmails.add(transaction.customer.email);
        }
      });

      hasMore = transactionsResult.data?.length === perPage; // Check if we received a full page
      if (hasMore) {
        page++;
      }
    }
    console.log(`Fetched ${transactionEmails.size} unique transaction maker emails.`);
    return Array.from(transactionEmails);
  } catch (error) {
    console.error("Error fetching transaction maker emails from Paystack:", error);
    throw error;
  }
}

async function main() {
  console.log("Starting Appwrite email script...");

  try {
    // Get all user emails
    const allUsers = await getAllUsersEmails();
    console.log("\nAll Users (ID and Email):");
    allUsers.forEach((user) =>
      console.log(`- ID: ${user.id}, Email: ${user.email}`)
    );

    // Get business owner emails
    const businessOwners = await getBusinessOwnerEmails();
    console.log("\nBusiness Owner Emails:");
    businessOwners.forEach((email) => console.log(`- ${email}`));

    // Get transaction maker emails
    const transactionMakers = await getTransactionMakerEmails();
    console.log("\nTransaction Maker Emails:");
    transactionMakers.forEach((email) => console.log(`- ${email}`));
  } catch (error) {
    console.error("Script failed:", error);
  }
  console.log("\nAppwrite email script finished.");
}

main();
