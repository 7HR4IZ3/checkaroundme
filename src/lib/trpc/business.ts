import { z } from "zod";
import {
  BusinessService,
  BusinessImagesService,
  BusinessHoursService,
} from "../appwrite";
import {
  createBusinessSchema,
  updateBusinessSchema,
  businessImageSchema,
  businessHoursSchema,
  businessSchema,
  daySchema,
} from "../schema";

import type SuperJSON from "superjson";

export function createBusinessProcedures(
  t: ReturnType<
    typeof import("@trpc/server").initTRPC.create<{
      transformer: typeof SuperJSON;
    }>
  >
) {
  return {
    createBusiness: t.procedure
      .input(
        createBusinessSchema.extend({
          userId: z.string(),
          hours: z.object({
            Mon: daySchema,
            Tue: daySchema,
            Wed: daySchema,
            Thu: daySchema,
            Fri: daySchema,
            Sat: daySchema,
            Sun: daySchema,
          }),
          images: z.array(
            z.object({ isPrimary: z.boolean(), imageID: z.string() })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const { userId, hours, images, ...data } = input;
        return await BusinessService.createBusiness(
          data,
          userId,
          hours,
          images
        );
      }),

    getBusinessById: t.procedure
      .input(z.object({ businessId: z.string() }))
      .query(async ({ input }) => {
        return await BusinessService.getBusinessById(input.businessId);
      }),

    updateBusiness: t.procedure
      .input(
        z.object({
          businessId: z.string(),
          data: updateBusinessSchema.extend({
            hours: z.object({
              Mon: daySchema,
              Tue: daySchema,
              Wed: daySchema,
              Thu: daySchema,
              Fri: daySchema,
              Sat: daySchema,
              Sun: daySchema,
            }).optional(),
            images: z.array(
              z.object({ isPrimary: z.boolean(), imageID: z.string() })
            ).optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        return await BusinessService.updateBusiness(
          input.businessId,
          input.data
        );
      }),

    listBusinesses: t.procedure
      .input(
        z.object({
          categories: z.array(z.string()).optional(),
          query: z.string().optional(),
          location: z.string().optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
          sortBy: z.string().optional(),
          sortDirection: z.enum(["asc", "desc"]).optional(),
        })
      )
      .query(async ({ input }) => {
        return await BusinessService.listBusinesses(input);
      }),

    getNearbyBusinesses: t.procedure
      .input(
        z.object({
          latitude: z.number(),
          longitude: z.number(),
          distance: z.number().optional(),
          limit: z.number().optional(),
        })
      )
      // .output(z.array(businessSchema))
      .query(async ({ input }) => {
        return await BusinessService.getNearbyBusinesses(
          input.latitude,
          input.longitude,
          input.distance,
          input.limit
        );
      }),

    // --- Business Images ---
    uploadBusinessImage: t.procedure
      .input(
        z.object({
          businessId: z.string(),
          file: z.any(), // File upload handling may need to be adapted for your setup
          title: z.string().optional(),
          userID: z.string().optional(),
          isPrimary: z.boolean().optional(),
        })
      )
      // .output(businessImageSchema)
      .mutation(async ({ input }) => {
        const { businessId, file, title, userID, isPrimary } = input;
        return await BusinessImagesService.uploadBusinessImage(
          businessId,
          file,
          title,
          userID,
          isPrimary
        );
      }),

    uploadTempBusinessImage: t.procedure
      .input(
        z.object({
          file: z.any(), // File upload handling may need to be adapted for your setup
          userID: z.string(),
        })
      )
      // .output(businessImageSchema)
      .mutation(async ({ input }) => {
        return await BusinessImagesService.uploadTempBusinessImage(
          input.file,
          input.userID
        );
      }),

    getBusinessImage: t.procedure
      .input(z.object({ businessId: z.string() }))
      // .output(businessImageSchema)
      .query(async ({ input }) => {
        return await BusinessImagesService.getBusinessImage(input.businessId);
      }),

    getBusinessImages: t.procedure
      .input(z.object({ businessId: z.string() }))
      // .output(z.array(businessImageSchema))
      .query(async ({ input }) => {
        return await BusinessImagesService.getBusinessImages(input.businessId);
      }),

    deleteBusinessImage: t.procedure
      .input(z.object({ imageId: z.string() }))
      .output(z.object({ success: z.boolean() }))
      .mutation(async ({ input }) => {
        await BusinessImagesService.deleteBusinessImage(input.imageId);
        return { success: true };
      }),

    // --- Business Hours ---
    setBusinessHours: t.procedure
      .input(
        z.object({
          businessId: z.string(),
          hours: z.object({
            Mon: daySchema,
            Tue: daySchema,
            Wed: daySchema,
            Thu: daySchema,
            Fri: daySchema,
            Sat: daySchema,
            Sun: daySchema,
          }),
        })
      )
      // .output(z.array(businessHoursSchema))
      .mutation(async ({ input }) => {
        return await BusinessHoursService.setBusinessHours(
          input.businessId,
          input.hours
        );
      }),

    getBusinessHours: t.procedure
      .input(z.object({ businessId: z.string() }))
      // .output(z.array(businessHoursSchema))
      .query(async ({ input }) => {
        return await BusinessHoursService.getBusinessHours(input.businessId);
      }),
  };
}
