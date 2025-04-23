import { z } from "zod";
import { ReviewService } from "../appwrite";
import { reviewSchema } from "../schema";
import type SuperJSON from "superjson";

export function createReviewProcedures(
  t: ReturnType<
    typeof import("@trpc/server").initTRPC.create<{
      transformer: typeof SuperJSON;
    }>
  >
) {
  return {
    createReview: t.procedure
      .input(
        z.object({
          businessId: z.string(),
          userId: z.string(),
          rating: z.number().min(1).max(5),
          text: z.string().min(5, "Review must be at least 5 characters"),
          title: z.string().optional(),
          recommendation: z.string().optional(),
        })
      )
      // .output(reviewSchema)
      .mutation(async ({ input }) => {
        const { businessId, userId, rating, text, title, recommendation } =
          input;
        return await ReviewService.createReview(
          businessId,
          userId,
          rating,
          text,
          title,
          recommendation
        );
      }),

    getBusinessReviews: t.procedure
      .input(
        z.object({
          businessId: z.string(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      // .output(z.object({ reviews: z.array(reviewSchema), total: z.number() }))
      .query(async ({ input }) => {
        return await ReviewService.getBusinessReviews(
          input.businessId,
          input.limit,
          input.offset
        );
      }),

    reactToReview: t.procedure
      .input(
        z.object({
          reviewId: z.string(),
          userId: z.string(),
          type: z.enum(["like", "dislike"]),
        })
      )
      // .output(z.object({ success: z.boolean() }))
      .mutation(async ({ input }) => {
        const { reviewId, userId, type } = input;
        const result = await ReviewService.reactToReview(reviewId, userId, type);
        return result; // Return the result from the service
      }),

    // Get a user's reaction for a specific review
    getUserReaction: t.procedure
      .input(z.object({ reviewId: z.string(), userId: z.string() }))
      .query(async ({ input }) => {
        const reaction = await ReviewService.getUserReaction(input.reviewId, input.userId);
        return reaction; // Return the reaction object or null
      }),

    replyToReview: t.procedure
      .input(
        z.object({
          reviewId: z.string(),
          replyText: z.string().min(1, "Reply cannot be empty"),
          // userId: z.string(), // Optional: Pass userId if needed for auth in ReviewService
        })
      )
      // .output(reviewSchema) // Assuming replyToReview returns the updated review
      .mutation(async ({ input }) => {
        const { reviewId, replyText } = input;
        // TODO: Potentially get userId from context if auth is implemented in tRPC middleware
        // and pass it to ReviewService.replyToReview if needed for authorization.
        return await ReviewService.replyToReview(reviewId, replyText);
      }),

   deleteReview: t.procedure
     .input(z.object({ reviewId: z.string() }))
     .mutation(async ({ input }) => {
       await ReviewService.deleteReview(input.reviewId);
       return { success: true };
     }),
  };
}
