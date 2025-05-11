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
  protectedProcedure: typeof t.procedure,
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
          images: z.array(
            z.object({ isPrimary: z.boolean(), imageID: z.string() }),
          ),
        }),
      )
      .mutation(async ({ input }) => {
        const { userId, hours, images, ...data } = input;
        return await BusinessService.createBusiness(
          data,
          userId,
          hours,
          images,
        );
      }),

    getBusinessById: t.procedure
      .input(z.object({ businessId: z.string() }))
      .query(async ({ input }) => {
        const { businessId } = input;
        // const cacheKey = `business:${businessId}`; // Cache logic moved to BusinessService

        // try {
        //   const cachedBusiness = await redisClient.get(cacheKey);
        //   if (cachedBusiness) {
        //     return JSON.parse(cachedBusiness) as Business;
        //   }
        // } catch (error) {
        //   console.error("Redis GET error:", error);
        // }

        const business = await BusinessService.getBusinessById(businessId);

        // if (business) { // Cache logic moved to BusinessService
        //   try {
        //     // Cache for 30 days (2592000 seconds)
        //     await redisClient.set(cacheKey, JSON.stringify(business), {
        //       EX: 2592000,
        //     });
        //   } catch (error) {
        //     console.error("Redis SET error:", error);
        //   }
        // }
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
            images: z
              .array(z.object({ isPrimary: z.boolean(), imageID: z.string() }))
              .optional(),
          }),
        }),
      )
      .mutation(async ({ input }) => {
        const { businessId, data } = input;
        const updatedBusiness = await BusinessService.updateBusiness(
          businessId,
          data,
        );

        // if (updatedBusiness) { // Cache invalidation moved to BusinessService
        //   const businessCacheKey = `business:${businessId}`;
        //   try {
        //     await redisClient.del(businessCacheKey);
        //   } catch (error) {
        //     console.error("Redis DEL error during updateBusiness:", error);
        //   }
        // }
        return updatedBusiness;
      }),

    listBusinesses: t.procedure
      .input(
        z.object({
          categories: z.array(z.string()).optional(),
          query: z.string().optional(),
          location: z.string().optional(),
          limit: z.number().optional().default(10),
          offset: z.number().optional().default(0),
          sortBy: z.string().optional().default("rating"),
          sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
          price: z.string().optional(),
          features: z.array(z.string()).optional(),
          // distances: z.array(z.string()).optional(), // Deprecated
          openNow: z.boolean().optional(),
          userLatitude: z.number().optional(),
          userLongitude: z.number().optional(),
          maxDistanceKm: z.number().optional(),
        }),
      )
      .query(async ({ input }) => {
        // Destructure all potential inputs, including new ones
        const {
          categories,
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
          categories,
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
          distanceKm: z.number().optional().default(10), // Renamed from distance
          limit: z.number().optional().default(10),
        }),
      )
      .query(async ({ input }) => {
        return await BusinessService.getNearbyBusinesses(
          input.latitude,
          input.longitude,
          input.distanceKm,
          input.limit,
        );
      }),

    // --- Business Images ---
    uploadBusinessImage: protectedProcedure
      .input(
        z.object({
          businessId: z.string(),
          file: z.any(), // File upload handling may need to be adapted for your setup
          title: z.string().optional(),
          userID: z.string().optional(),
          isPrimary: z.boolean().optional(),
        }),
      )
      // .output(businessImageSchema)
      .mutation(async ({ input }) => {
        const { businessId, file, title, userID, isPrimary } = input;
        const result = await BusinessImagesService.uploadBusinessImage(
          businessId,
          file,
          title,
          userID,
          isPrimary,
        );

        // Cache invalidation for images should be handled in BusinessImagesService if needed
        // if (result) {
        //   const cacheKeyImages = `businessImages:${businessId}`;
        //   try {
        //     await redisClient.del(cacheKeyImages);
        //   } catch (error) {
        //     console.error(
        //       "Redis DEL error for businessImages during upload:",
        //       error
        //     );
        //   }
        // }
        return result;
      }),

    uploadTempBusinessImage: protectedProcedure
      .input(
        z.object({
          file: z.any(), // File upload handling may need to be adapted for your setup
          userID: z.string(),
        }),
      )
      // .output(businessImageSchema)
      .mutation(async ({ input }) => {
        return await BusinessImagesService.uploadTempBusinessImage(
          input.file,
          input.userID,
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
        const { businessId } = input;
        // const cacheKey = `businessImages:${businessId}`; // Cache logic should be in BusinessImagesService

        // try {
        //   const cachedImages = await redisClient.get(cacheKey);
        //   if (cachedImages) {
        //     return JSON.parse(cachedImages) as BusinessImage[];
        //   }
        // } catch (error) {
        //   console.error("Redis GET error for businessImages:", error);
        // }

        const images =
          await BusinessImagesService.getBusinessImages(businessId);

        // if (images) { // Cache logic should be in BusinessImagesService
        //   try {
        //     // Cache for 30 days
        //     await redisClient.set(cacheKey, JSON.stringify(images), {
        //       EX: 2592000,
        //     });
        //   } catch (error) {
        //     console.error("Redis SET error for businessImages:", error);
        //   }
        // }
        return images;
      }),

    deleteBusinessImage: t.procedure
      .input(z.object({ imageId: z.string(), businessId: z.string() }))
      .output(z.object({ success: z.boolean() }))
      .mutation(async ({ input }) => {
        const { imageId, businessId } = input; // businessId can be used if BusinessImagesService needs it for cache invalidation
        await BusinessImagesService.deleteBusinessImage(imageId);

        // Cache invalidation for images should be handled in BusinessImagesService
        // const imagesCacheKey = `businessImages:${businessId}`;
        // try {
        //   await redisClient.del(imagesCacheKey);
        // } catch (error) {
        //   console.error("Redis DEL error during image delete:", error);
        // }
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
        }),
      )
      // .output(z.array(businessHoursSchema))
      .mutation(async ({ input }) => {
        const { businessId, hours } = input;
        const result = await BusinessHoursService.setBusinessHours(
          businessId,
          hours,
        );

        // Cache invalidation for hours should be handled in BusinessHoursService
        // const hoursCacheKey = `businessHours:${businessId}`;
        // try {
        //   await redisClient.del(hoursCacheKey);
        // } catch (error) {
        //   console.error("Redis DEL error during setBusinessHours:", error);
        // }

        return result;
      }),

    getBusinessHours: t.procedure
      .input(z.object({ businessId: z.string() }))
      // .output(z.array(businessHoursSchema))
      .query(async ({ input }) => {
        const { businessId } = input;
        // const cacheKey = `businessHours:${businessId}`; // Cache logic should be in BusinessHoursService

        // try {
        //   const cachedHours = await redisClient.get(cacheKey);
        //   if (cachedHours) {
        //     return JSON.parse(cachedHours) as BusinessHours[];
        //   }
        // } catch (error) {
        //   console.error("Redis GET error for businessHours:", error);
        // }

        const hours = await BusinessHoursService.getBusinessHours(businessId);

        // if (hours) { // Cache logic should be in BusinessHoursService
        //   try {
        //     // Cache for 30 days
        //     await redisClient.set(cacheKey, JSON.stringify(hours), {
        //       EX: 2592000,
        //     });
        //   } catch (error) {
        //     console.error("Redis SET error for businessHours:", error);
        //   }
        // }
        return hours;
      }),

    getBusinessesByUserId: t.procedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        return await BusinessService.getBusinessesByUserId(input.userId);
      }),
  };
}
