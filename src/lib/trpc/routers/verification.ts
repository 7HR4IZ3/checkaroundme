import { z } from "zod";
import { TRPCError } from "@trpc/server";
import SuperJSON from "superjson"; // Assuming superjson is used based on other routers
import { VerificationService } from "@/lib/appwrite/services/verification";
import { AuthService } from "@/lib/appwrite/services/auth";
import { businessSchema, verificationDocumentSchema } from "@/lib/schema"; // Import the schemas
import { Models } from "node-appwrite"; // Import Models for type safety

// Placeholder for admin check logic
// In a real application, this would involve checking user roles, teams, etc.
const isAdmin = (userId: string): boolean => {
  // Replace with actual admin check logic
  console.warn(`isAdmin check for user ${userId} is a placeholder!`);
  // For now, let's assume a specific user ID is admin for testing,
  // or simply return true/false based on development needs.
  // return userId === 'admin-user-id';
  return true; // Placeholder: Allow all authenticated users for now
};

// --- Schemas ---

// Schema for the output of listPendingVerifications
const pendingVerificationDetailsSchema = z.object({
  // Use existing schema, ensure it includes necessary fields like $id, businessId, userId, documentFileId
  verificationDocument: verificationDocumentSchema.extend({
      $id: z.string(), // Ensure $id is present
      businessId: z.string(),
      userId: z.string(),
      documentFileId: z.string(),
      adminNotes: z.string().nullable().optional(), // Add adminNotes if needed
      // Add other fields from your verificationDocumentSchema as needed
  }),
  business: businessSchema.pick({ // Pick relevant fields from existing business schema
      $id: true,
      name: true,
      // Add other relevant business fields as needed e.g., address
  }),
  user: z.object({ // Define expected user details explicitly or use/extend a user schema
      $id: z.string(),
      name: z.string().nullable(), // Appwrite name can be null
      email: z.string().email(),
      // Add other relevant user fields as needed
  }),
  documentFileUrl: z.string().url(), // URL for accessing the document
});

// Input schema for updateVerificationStatus
const updateVerificationStatusInputSchema = z.object({
  verificationDocumentId: z.string(),
  businessId: z.string(),
  newStatus: z.enum(["verified", "rejected"]),
  adminNotes: z.string().optional(),
});

// Output schema for updateVerificationStatus
const updateVerificationStatusOutputSchema = z.object({
  success: z.boolean(),
});



// Define the tRPC instance type based on other routers
type TRPCInstance = ReturnType<
  typeof import("@trpc/server").initTRPC.create<{
    transformer: typeof SuperJSON;
    innerContext: { user?: Models.User<Models.Preferences>, profile?: any };
    meta: {};
  }>
>;

export function createVerificationProcedures(t: TRPCInstance) {
  // Middleware to check if user is authenticated
  const isAuthed = t.middleware(async ({ next }) => {
    const authResult = await AuthService.getCurrentUser();
    if (!authResult?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        // Pass user info to the procedure context
        user: authResult.user,
        profile: authResult.profile,
      },
    });
  });

  // Create a protected procedure using the middleware
  const protectedProcedure = t.procedure.use(isAuthed);

  // Create an admin-protected procedure
  const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
    // Ensure user context exists (should be guaranteed by protectedProcedure)
    if (!ctx.user) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'User context missing in admin procedure.' });
    }
    // Perform the admin check using the placeholder function
    if (!isAdmin(ctx.user.$id)) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin privileges required." });
    }
    return next({ ctx }); // Pass context along
  });


  return {
    submitVerification: protectedProcedure
      .input(
        z.object({
          businessId: z.string(),
          documentFileId: z.string(), // ID received from the upload API route
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { businessId, documentFileId } = input;
        const userId = ctx.user.$id; // Get user ID from context provided by middleware

        // 1. Verify Business Ownership
        const isOwner = await VerificationService.isUserBusinessOwner(
          userId,
          businessId
        );
        if (!isOwner) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User does not own this business.",
          });
        }

        try {
          // 2. Create Verification Document Record in Database
          const verificationRecord =
            await VerificationService.createVerificationDocumentRecord(
              businessId,
              userId,
              documentFileId
            );

          // 3. Update Business Status to 'pending'
          await VerificationService.updateBusinessVerificationStatus(
            businessId,
            "pending"
          );

          // 4. Return success or the created record
          return {
            success: true,
            verificationId: verificationRecord.$id,
          };
        } catch (error) {
          console.error("Error submitting verification:", error);
          // Throw a tRPC error for client handling
          if (error instanceof Error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to submit verification: ${error.message}`,
              cause: error,
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "An unknown error occurred during verification submission.",
          });
        }
      }),

    // --- Admin Procedures ---
    listPendingVerifications: adminProcedure
      .output(z.array(pendingVerificationDetailsSchema))
      .query(async ({ ctx }) => {
        // No input needed for basic listing, add pagination input later if needed
        try {
          // Call the Appwrite service function to get pending verifications with details
          // This function needs to be implemented in VerificationService
          // It should fetch verification docs where business status is 'pending',
          // then fetch related business, user, and generate file URLs.
          const pendingVerifications = await VerificationService.listPendingVerificationsWithDetails();

          // Validate the structure of the returned data (optional but recommended)
          // This assumes the service function returns data matching the schema structure
          // Use .safeParse for better error handling if needed
          const parsedData = pendingVerificationDetailsSchema.array().parse(pendingVerifications);
          return parsedData;

        } catch (error) {
          console.error("Error listing pending verifications:", error);
          if (error instanceof z.ZodError) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to parse verification data.',
                cause: error,
            });
          }
          if (error instanceof Error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to list pending verifications: ${error.message}`,
              cause: error,
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An unknown error occurred while listing pending verifications.",
          });
        }
      }),

    updateVerificationStatus: adminProcedure
      .input(updateVerificationStatusInputSchema)
      .output(updateVerificationStatusOutputSchema)
      .mutation(async ({ input, ctx }) => {
        const { verificationDocumentId, businessId, newStatus, adminNotes } = input;

        try {
          // 1. Optional: Fetch verification document to ensure it exists before proceeding
          //    (Could be handled within the service update function too)
          // const docExists = await VerificationService.getVerificationDocument(verificationDocumentId);
          // if (!docExists) {
          //   throw new TRPCError({ code: 'NOT_FOUND', message: 'Verification document not found.' });
          // }

          // 2. Update the business verification status
          // This service function likely exists or needs creation/modification in BusinessService or VerificationService
          await VerificationService.updateBusinessVerificationStatus(
            businessId,
            newStatus
          );

          // 3. If admin notes are provided, update the verification document record
          if (adminNotes !== undefined) { // Check for undefined explicitly if optional
            // This service function needs to be implemented in VerificationService
            await VerificationService.updateVerificationAdminNotes(
              verificationDocumentId,
              adminNotes // Pass null if adminNotes is empty string and you want to clear it
            );
          }

          // 4. Return success
          return { success: true };

        } catch (error) {
          console.error("Error updating verification status:", error);
          if (error instanceof Error) {
            // Handle potential specific errors, e.g., AppwriteException
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to update verification status: ${error.message}`,
              cause: error,
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An unknown error occurred while updating verification status.",
          });
        }
      }),
  };
}
