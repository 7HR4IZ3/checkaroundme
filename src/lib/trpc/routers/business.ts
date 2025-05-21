import { z } from "zod";
// import redisClient from "../../redis"; // Removed Redis client import
import { BusinessService } from "../../appwrite/services/business";
import { BusinessImagesService } from "../../appwrite/services/business-images";
import { BusinessHoursService } from "../../appwrite/services/business-hours";
import {
  createBusinessSchema,
  updateBusinessSchema,
  businessImageSchema,
  businessHoursSchema,
  businessSchema,
  daySchema,
  BusinessImage,
  BusinessHours,
  Business,
} from "../../schema";

import type { AppTRPC } from "../router";

export function createBusinessProcedures(
  t: AppTRPC,
  protectedProcedure: typeof t.procedure
) {
  return {
    createBusiness: protectedProcedure
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
          images: z.array(businessImageSchema),
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
        const { businessId } = input;
        const business = await BusinessService.getBusinessById(businessId);
        return business;
      }),

    updateBusiness: protectedProcedure
      .input(
        z.object({
          businessId: z.string(),
          data: updateBusinessSchema.extend({
            hours: z
              .object({
                Mon: daySchema,
                Tue: daySchema,
                Wed: daySchema,
                Thu: daySchema,
                Fri: daySchema,
                Sat: daySchema,
                Sun: daySchema,
              })
              .optional(),
            images: z.array(businessImageSchema).optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        const { businessId, data } = input;
        const updatedBusiness = await BusinessService.updateBusiness(
          businessId,
          data
        );
        return updatedBusiness;
      }),

    listBusinesses: t.procedure
      .input(
        z.object({
          category: z.string().optional(),
          query: z.string().optional(),
          location: z.string().optional(),
          limit: z.number().optional().default(10),
          offset: z.number().optional().default(0),
          sortBy: z.string().optional().default("rating"),
          sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
          price: z.string().optional(),
          features: z.array(z.string()).optional(),
          openNow: z.boolean().optional(),
          userLatitude: z.number().optional(),
          userLongitude: z.number().optional(),
          maxDistanceKm: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        const {
          category,
          query,
          location,
          limit,
          offset,
          sortBy,
          sortDirection,
          price,
          features,
          openNow,
          userLatitude,
          userLongitude,
          maxDistanceKm,
        } = input;

        return await BusinessService.listBusinesses({
          category,
          query,
          location,
          limit,
          offset,
          sortBy,
          sortDirection,
          price,
          features,
          openNow,
          userLatitude,
          userLongitude,
          maxDistanceKm,
        });
      }),

    getNearbyBusinesses: t.procedure
      .input(
        z.object({
          latitude: z.number(),
          longitude: z.number(),
          distanceKm: z.number().optional().default(10),
          limit: z.number().optional().default(10),
        })
      )
      .query(async ({ input }) => {
        return await BusinessService.getNearbyBusinesses(
          input.latitude,
          input.longitude,
          input.distanceKm,
          input.limit
        );
      }),

    uploadBusinessImage: protectedProcedure
      .input(
        z.object({
          businessId: z.string(),
          file: z.any(),
          title: z.string().optional(),
          userID: z.string().optional(),
          isPrimary: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { businessId, file, title, userID, isPrimary } = input;
        const result = await BusinessImagesService.uploadBusinessImage(
          businessId,
          file,
          title,
          userID,
          isPrimary
        );
        return result;
      }),

    uploadTempBusinessImage: protectedProcedure
      .input(
        z.object({
          file: z.any(),
          userID: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return await BusinessImagesService.uploadTempBusinessImage(
          input.file,
          input.userID
        );
      }),

    getBusinessImage: t.procedure
      .input(z.object({ businessId: z.string() }))
      .query(async ({ input }) => {
        return await BusinessImagesService.getBusinessImage(input.businessId);
      }),

    getBusinessImages: t.procedure
      .input(z.object({ businessId: z.string() }))
      .query(async ({ input }) => {
        const { businessId } = input;
        const images = await BusinessImagesService.getBusinessImages(
          businessId
        );
        return images;
      }),

    deleteBusinessImage: t.procedure
      .input(z.object({ imageId: z.string(), businessId: z.string() }))
      .output(z.object({ success: z.boolean() }))
      .mutation(async ({ input }) => {
        const { imageId } = input;
        await BusinessImagesService.deleteBusinessImage(imageId);
        return { success: true };
      }),

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
      .mutation(async ({ input }) => {
        const { businessId, hours } = input;
        const result = await BusinessHoursService.setBusinessHours(
          businessId,
          hours
        );
        return result;
      }),

    getBusinessHours: t.procedure
      .input(z.object({ businessId: z.string() }))
      .query(async ({ input }) => {
        const { businessId } = input;
        const hours = await BusinessHoursService.getBusinessHours(businessId);
        return hours;
      }),

    getBusinessesByUserId: t.procedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        return await BusinessService.getBusinessesByUserId(input.userId);
      }),
  };
}
