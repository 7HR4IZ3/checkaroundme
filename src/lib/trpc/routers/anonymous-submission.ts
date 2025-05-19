import { z } from "zod";
import { AppTRPC } from "../router";
import { AnonymousSubmissionService } from "@/lib/appwrite";
import { anonymousSubmissionSchema } from "@/lib/schema";

export const createAnonymousSubmissionRouter = (
  t: AppTRPC,
  protectedProcedure: typeof t.procedure
) => {
  return {
    createAnonymousSubmission: protectedProcedure
      .input(
        anonymousSubmissionSchema.omit({
          $id: true,
          createdAt: true,
          updatedAt: true,
        })
      )
      .mutation(async ({ input }) => {
        try {
          const newSubmission =
            await AnonymousSubmissionService.createAnonymousSubmission(input);
          return newSubmission;
        } catch (error) {
          console.error("Error creating anonymous submission:", error);
          throw new Error("Failed to create anonymous submission.");
        }
      }),
    getAnonymousSubmissionById: protectedProcedure
      .input(z.string()) // Expecting the documentId as a string
      .query(async ({ input: documentId }) => {
        try {
          const submission =
            await AnonymousSubmissionService.getAnonymousSubmissionById(
              documentId
            );
          return submission;
        } catch (error) {
          console.error(
            `Error fetching anonymous submission ${documentId}:`,
            error
          );
          // Handle specific Appwrite errors, e.g., document not found
          if ((error as any).code === 404) {
            throw new Error("Anonymous submission not found.");
          }
          throw new Error("Failed to fetch anonymous submission.");
        }
      }),
   getAllAnonymousSubmission: protectedProcedure
     .query(async () => {
       try {
         const submissions =
           await AnonymousSubmissionService.getAllAnonymousSubmissions(); // Assuming this method exists
         return submissions;
       } catch (error) {
         console.error("Error fetching all anonymous submissions:", error);
         throw new Error("Failed to fetch all anonymous submissions.");
       }
     }),
 };
};
