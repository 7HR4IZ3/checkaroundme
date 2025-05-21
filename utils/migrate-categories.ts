import "dotenv/config"; // Assuming you use dotenv for environment variables
import { client, databases, DATABASE_ID, BUSINESSES_COLLECTION_ID } from "../src/lib/appwrite/index";
import { Query } from "node-appwrite";

// Use constants from src/lib/appwrite/index.ts
const databaseId = DATABASE_ID;
const collectionId = BUSINESSES_COLLECTION_ID;

async function migrateCategories() {
  console.log(`Starting migration for collection: ${collectionId}`);

  let offset = 0;
  const limit = 100; // Process documents in batches

  try {
    while (true) {
      // Fetch documents from the collection
      const response = await databases.listDocuments(databaseId, collectionId, [
        Query.limit(limit),
        Query.offset(offset),
        // Optional: Add a query to only fetch documents that still have the 'categories' array
        // Query.notEqual('categories', null),
        // Query.greaterThan('categories', []), // This might not work as expected for arrays, manual check is safer
      ]);

      const documents = response.documents;

      if (documents.length === 0) {
        console.log("No more documents to process.");
        break; // No more documents
      }

      console.log(`Processing batch starting from offset: ${offset}`);

      for (const document of documents) {
        const documentId = document.$id;
        const categories = document["categories"];

        if (Array.isArray(categories) && categories.length > 0) {
          const firstCategory = categories[0];

          try {
            // Update the document with the new 'category' attribute
            await databases.updateDocument(
              databaseId,
              collectionId,
              documentId,
              {
                category: firstCategory,
                // Optional: Remove the old 'categories' attribute if no longer needed
                // categories: null // Or omit it from the update payload if your schema allows
              }
            );
            console.log(
              `Updated document ${documentId} with category: ${firstCategory}`
            );
          } catch (updateError: any) {
            console.error(
              `Error updating document ${documentId}:`,
              updateError.message
            );
          }
        } else {
          console.log(
            `Document ${documentId} has no categories array or it's empty. Skipping.`
          );
        }
      }

      offset += limit; // Move to the next batch
    }

    console.log("Migration process completed.");
  } catch (error: any) {
    console.error("Error listing documents:", error.message);
  }
}

migrateCategories();
