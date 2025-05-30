import { z } from "zod";
import { AppTRPC } from "../router";
import {
  ANONYMOUS_SUBMISSIONS_COLLECTION_ID,
  AnonymousSubmissionService,
  DATABASE_ID,
  databases,
} from "@/lib/appwrite";
import { AnonymousSubmission, anonymousSubmissionSchema } from "@/lib/schema";
import { Query } from "node-appwrite";

export const createAnonymousSubmissionRouter = (
  t: AppTRPC,
  protectedProcedure: typeof t.procedure
) => {
  return {
    createAnonymousSubmission: protectedProcedure
      .input(
        anonymousSubmissionSchema.omit({
          $id: true,
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
      .input(
        z
          .object({
            page: z.number().min(1).default(1),
            perPage: z.number().min(1).max(100).default(10),
            filter: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        try {
          const page = input?.page || 1;
          const perPage = input?.perPage || 10;
          const filter = input?.filter;
          // Use the service method and pass pagination params
          return await AnonymousSubmissionService.getAllAnonymousSubmissions({
            page,
            perPage,
            filter,
          });
        } catch (error) {
          console.error("Error fetching all anonymous submissions:", error);
          throw new Error("Failed to fetch all anonymous submissions.");
        }
      }),
    deleteAnonymousSubmission: protectedProcedure
      .input(z.object({ id: z.string().min(1) }))
      .mutation(async ({ input }) => {
        try {
          await databases.deleteDocument(
            DATABASE_ID,
            ANONYMOUS_SUBMISSIONS_COLLECTION_ID,
            input.id
          );
          return { success: true };
        } catch (error) {
          console.error("Delete error:", error);
          throw new Error("Failed to delete submission.");
        }
      }),
    deleteAnonymousSubmissions: protectedProcedure
      .input(z.object({ ids: z.array(z.string().min(1)) }))
      .mutation(async ({ input }) => {
        try {
          await Promise.allSettled(
            input.ids.map((id) =>
              databases.deleteDocument(
                DATABASE_ID,
                ANONYMOUS_SUBMISSIONS_COLLECTION_ID,
                id
              )
            )
          );
          return { success: true };
        } catch (error) {
          console.error("Batch delete error:", error);
          throw new Error("Failed to delete submissions.");
        }
      }),
  };
};
