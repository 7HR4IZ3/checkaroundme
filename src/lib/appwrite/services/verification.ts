import { ID, Query, Models } from "node-appwrite";
import {
  databases,
  storage,
  DATABASE_ID,
  USERS_COLLECTION_ID,
  BUSINESSES_COLLECTION_ID,
} from "@/lib/appwrite/index"; // Added USERS_COLLECTION_ID, BUSINESSES_COLLECTION_ID
import {
  Business,
  VerificationDocument,
  verificationDocumentSchema,
  businessSchema, // Added businessSchema
  User, // Added User type if available in schema.ts, otherwise define inline
} from "@/lib/schema"; // Assuming schema is updated
import { BusinessService } from "./business"; // To update business status and fetch business details
import { AuthService } from "./auth"; // To fetch user details

// Use process.env directly for IDs not exported from index.ts
const VERIFICATION_COLLECTION_ID = "verifications";
const VERIFICATION_BUCKET_ID = "67fc0ef9000e1bba4e5d";

async function getUserDetails(
  userId: string,
): Promise<Partial<Models.User<Models.Preferences>> | null> {
  try {
    // Assuming AuthService.getUserById exists or implement direct fetch
    // const user = await AuthService.getUserById(userId);
    // Direct fetch example:
    const user = await databases.getDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId,
    );
    return { $id: user.$id, name: user.name, email: user.email }; // Return only needed fields
  } catch (error) {
    console.error(`Error fetching user details for ${userId}:`, error);
    return null; // Return null if user not found or error occurs
  }
}

// Helper function to safely get business details
async function getBusinessDetails(
  businessId: string,
): Promise<Partial<Business & Models.Document> | null> {
  try {
    // Use BusinessService or direct fetch
    const business = await BusinessService.getBusinessById(businessId);
    if (!business) {
      return null;
    }

    return {
      $id: business.$id,
      name: business.name,
      verificationStatus: business.verificationStatus,
    }; // Return only needed fields
  } catch (error) {
    console.error(`Error fetching business details for ${businessId}:`, error);
    return null; // Return null if business not found or error occurs
  }
}

export const VerificationService = {
  /**
   * Uploads a verification document file to Appwrite Storage.
   * @param file - The File object to upload.
   * @param userId - The ID of the user uploading the file.
   * @returns The Appwrite file ID.
   */
  async uploadVerificationDocument(
    file: File,
    userId: string,
  ): Promise<string> {
    console.log(
      `Uploading verification document "${file.name}" for user ${userId} to bucket ${VERIFICATION_BUCKET_ID}`,
    );
    try {
      const response = await storage.createFile(
        VERIFICATION_BUCKET_ID,
        ID.unique(), // Let Appwrite generate a unique ID
        file,
        // TODO: Add permissions if necessary, e.g., read access for specific admin roles
        // [Permission.read(Role.team('admins'))]
      );
      console.log(`File uploaded successfully: ${response.$id}`);
      return response.$id;
    } catch (error) {
      console.error("Error uploading verification document:", error);
      throw new Error("Failed to upload verification document.");
    }
  },

  /**
   * Creates a verification document record in the database.
   * @param businessId - The ID of the related business.
   * @param userId - The ID of the user submitting the document.
   * @param documentFileId - The Appwrite file ID of the uploaded document.
   * @returns The newly created verification document record.
   */
  async createVerificationDocumentRecord(
    businessId: string,
    userId: string,
    documentFileId: string,
  ): Promise<Models.Document & VerificationDocument> {
    console.log(
      `Creating verification document record for business ${businessId}, user ${userId}, file ${documentFileId}`,
    );
    try {
      // Prepare data according to schema (excluding fields Appwrite handles)
      const docData = {
        business: businessId, // Assuming 'business' is the attribute key linking to the business collection
        submittedBy: userId, // Assuming 'submittedBy' links to the user
        documentFileId: documentFileId,
        status: "pending", // Initial status
        // submittedAt is handled by Appwrite's $createdAt
        // adminNotes will be added later during review
      };

      // Validate against a partial schema if needed

      // Type parameter for createDocument should represent the data being passed
      const document = await databases.createDocument(
        DATABASE_ID,
        VERIFICATION_COLLECTION_ID,
        ID.unique(),
        docData,
      );
      console.log(`Verification document record created: ${document.$id}`);
      // Cast the result to the combined type
      return document as unknown as Models.Document & VerificationDocument;
    } catch (error) {
      console.error("Error creating verification document record:", error);
      throw new Error("Failed to create verification document record.");
    }
  },

  /**
   * Updates the verification status of a business.
   * @param businessId - The ID of the business to update.
   * @param status - The new verification status.
   */
  async updateBusinessVerificationStatus(
    businessId: string,
    status: Business["verificationStatus"],
  ): Promise<void> {
    console.log(
      `Updating verification status for business ${businessId} to ${status}`,
    );
    try {
      await BusinessService.updateBusiness(businessId, {
        verificationStatus: status,
      });
      // Direct update example (if BusinessService wasn't available or suitable):
      // await databases.updateDocument(
      // 	DATABASE_ID,
      // 	process.env.APPWRITE_BUSINESSES_COLLECTION_ID!, // Use env var for business collection ID
      // 	businessId,
      // 	{ verificationStatus: status }
      // );
      console.log(`Business ${businessId} status updated successfully.`);
    } catch (error) {
      console.error("Error updating business verification status:", error);
      throw new Error("Failed to update business verification status.");
    }
  },

  /**
   * Checks if a user owns a specific business.
   * @param userId - The ID of the user.
   * @param businessId - The ID of the business.
   * @returns True if the user owns the business, false otherwise.
   */
  async isUserBusinessOwner(
    userId: string,
    businessId: string,
  ): Promise<boolean> {
    try {
      const business = await BusinessService.getBusinessById(businessId);
      return business?.ownerId === userId;
    } catch (error) {
      // If business not found or other error, assume not owner
      console.error(
        `Error checking business ownership for user ${userId}, business ${businessId}:`,
        error,
      );
      return false;
    }
  },

  /**
   * Lists verification documents associated with businesses whose status is 'pending'.
   * Fetches related business, user details, and generates a file view URL.
   * @returns Array of pending verification details.
   */
  async listPendingVerificationsWithDetails(): Promise<any[]> {
    // Return type matches expected structure
    console.log("Fetching pending verification documents...");
    try {
      // 1. Fetch businesses with 'pending' verification status
      const pendingBusinesses = await databases.listDocuments(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        [Query.equal("verificationStatus", "pending")],
      );

      if (pendingBusinesses.total === 0) {
        console.log("No businesses found with pending verification status.");
        return [];
      }

      const pendingBusinessIds = pendingBusinesses.documents.map(
        (doc) => doc.$id,
      );

      // 2. Fetch verification documents linked to these businesses
      //    We might need to fetch all and filter, or use multiple queries if the list is large.
      //    Let's fetch all verification documents for simplicity here, assuming the number isn't huge.
      //    A better approach for scale would be multiple `Query.equal('business', businessId)` or adjusting data model.
      const allVerificationDocs = await databases.listDocuments<
        Models.Document & VerificationDocument
      >(
        DATABASE_ID,
        VERIFICATION_COLLECTION_ID,
        // Add query for status='pending' on the verification doc itself if applicable
        // [Query.limit(100)] // Add pagination/limits for production
      );

      // Filter verification docs belonging to pending businesses
      const relevantVerificationDocs = allVerificationDocs.documents.filter(
        (doc) => pendingBusinessIds.includes(doc.business),
      );

      if (relevantVerificationDocs.length === 0) {
        console.log("No verification documents found for pending businesses.");
        return [];
      }

      console.log(
        `Found ${relevantVerificationDocs.length} relevant verification documents.`,
      );

      // 3. Enrich each document with related data
      const detailedVerifications = await Promise.all(
        relevantVerificationDocs.map(async (doc) => {
          const businessDetails = await getBusinessDetails(doc.business);
          const userDetails = await getUserDetails(doc.submittedBy);
          let documentFileUrl = "";

          try {
            // Generate a temporary URL to view the file (adjust expiration as needed)
            const url = await storage.getFileView(
              VERIFICATION_BUCKET_ID,
              doc.documentFileId,
            );
            documentFileUrl = url.toString();
          } catch (fileError) {
            console.error(
              `Error getting file view URL for ${doc.documentFileId}:`,
              fileError,
            );
            // Handle cases where the file might be missing or inaccessible
          }

          // Construct the final object matching pendingVerificationDetailsSchema
          return {
            verificationDocument: {
              ...doc, // Spread existing doc fields
              // Ensure all fields required by schema are present
              $id: doc.$id,
              businessId: doc.business,
              userId: doc.submittedBy,
              documentFileId: doc.documentFileId,
              status: doc.status, // Assuming status exists on verification doc
              submittedAt: doc.$createdAt, // Map Appwrite timestamp
              adminNotes: doc.adminNotes ?? null,
            },
            business: businessDetails
              ? {
                  // Use fetched details, provide defaults/null if not found
                  $id: businessDetails.$id,
                  name: businessDetails.name ?? "Unknown Business",
                }
              : null,
            user: userDetails
              ? {
                  // Use fetched details, provide defaults/null if not found
                  $id: userDetails.$id,
                  name: userDetails.name ?? null,
                  email: userDetails.email ?? "unknown@example.com",
                }
              : null,
            documentFileUrl: documentFileUrl,
          };
        }),
      );

      // Filter out any entries where essential data couldn't be fetched (optional)
      const validVerifications = detailedVerifications.filter(
        (v) => v.business && v.user && v.documentFileUrl,
      );

      console.log(
        `Returning ${validVerifications.length} detailed pending verifications.`,
      );
      return validVerifications;
    } catch (error) {
      console.error("Error listing pending verifications with details:", error);
      throw new Error("Failed to list pending verifications.");
    }
  },

  /**
   * Updates the admin notes on a specific verification document.
   * @param verificationDocumentId - The ID of the verification document to update.
   * @param adminNotes - The notes to add or update. Can be null to clear notes.
   * @returns The updated document.
   */
  async updateVerificationAdminNotes(
    verificationDocumentId: string,
    adminNotes: string | null,
  ): Promise<Models.Document> {
    console.log(
      `Updating admin notes for verification document ${verificationDocumentId}`,
    );
    try {
      const updatedDocument = await databases.updateDocument(
        DATABASE_ID,
        VERIFICATION_COLLECTION_ID,
        verificationDocumentId,
        { adminNotes: adminNotes }, // Pass null to clear the field if desired
      );
      console.log(
        `Admin notes updated successfully for ${verificationDocumentId}`,
      );
      return updatedDocument;
    } catch (error) {
      console.error(
        `Error updating admin notes for ${verificationDocumentId}:`,
        error,
      );
      throw new Error("Failed to update verification admin notes.");
    }
  },
};
