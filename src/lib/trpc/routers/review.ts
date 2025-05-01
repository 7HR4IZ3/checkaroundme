import { z } from "zod";
import { ReviewService } from "../../appwrite"; // Import Review type if needed
import { reviewSchema, Review } from "../../schema";
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
          parentReviewId: z.string().optional(), // Added for replies
        })
      )
      // .output(reviewSchema)
      .mutation(async ({ input }) => {
        return await ReviewService.createReview(input);
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
        const result = await ReviewService.reactToReview(
          reviewId,
          userId,
          type
        );
        return result; // Return the result from the service
      }),

    // Get a user's reaction for a specific review
    getUserReaction: t.procedure
      .input(z.object({ reviewId: z.string(), userId: z.string() }))
      .query(async ({ input }) => {
        const reaction = await ReviewService.getUserReaction(
          input.reviewId,
          input.userId
        );
        return reaction; // Return the reaction object or null
      }),

    deleteReview: t.procedure
      .input(z.object({ reviewId: z.string() }))
      .mutation(async ({ input }) => {
        await ReviewService.deleteReview(input.reviewId);
        return { success: true };
      }),

    updateReview: t.procedure
      .input(
        z.object({
          reviewId: z.string(),
          text: z.string().min(5, "Review text must be at least 5 characters"),
          rating: z.number().min(1).max(5), // Added rating for editing
          // Add other fields like title if needed for editing
        })
      )
      // .output(reviewSchema) // Or maybe just { success: boolean }
      .mutation(async ({ input }) => {
        return await ReviewService.updateReview(input.reviewId, {
          text: input.text,
          rating: input.rating, // Pass the rating to the service
        });
      }),

    getReviewReplies: t.procedure
      .input(z.object({ parentReviewId: z.string() }))
      // .output(z.array(reviewSchema)) // Output can be inferred
      .query(async ({ input }) => {
        return await ReviewService.getReviewReplies(input.parentReviewId);
      }),
  };
}
