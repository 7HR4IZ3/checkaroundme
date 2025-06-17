import { ID, Query } from "node-appwrite";

import { BusinessHours, DaySchema } from "../../schema"; // Corrected schema import path

import { databases, DATABASE_ID, BUSINESS_HOURS_COLLECTION_ID } from "../index"; // Assuming databases and constants remain in index.ts

// Business Hours Service
export const BusinessHoursService = {
  // Add/update business hours
  async setBusinessHours(
    businessId: string,
    hours: { [key: string]: DaySchema }
  ): Promise<BusinessHours[]> {
    try {
      const existing = await databases.listDocuments(
        DATABASE_ID,
        BUSINESS_HOURS_COLLECTION_ID,
        [Query.equal("businessId", businessId)]
      );

      // Delete old hours
      for (const doc of existing.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          BUSINESS_HOURS_COLLECTION_ID,
          doc.$id
        );
      }

      // Create new hours
      const results = [];
      for (const hour in hours) {
        const newHour = await databases.createDocument(
          DATABASE_ID,
          BUSINESS_HOURS_COLLECTION_ID,
          ID.unique(),
          {
            businessId,
            day: hour,
            openTime: hours[hour].open,
            closeTime: hours[hour].close,
            isClosed: hours[hour].closed,
          }
        );

        results.push(newHour);
      }

      return results as unknown as BusinessHours[];
    } catch (error) {
      console.error("Set business hours error:", error);
      throw error;
    }
  },

  async getBusinessHour(
    businessId: string,
    day: string
  ): Promise<BusinessHours | null> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        BUSINESS_HOURS_COLLECTION_ID,
        [
          Query.equal("businessId", businessId),
          Query.equal("day", day),
          Query.limit(1),
        ]
      );

      return result.documents?.at(0) as unknown as BusinessHours;
    } catch (error) {
      console.error("Get business hours error:", error);
      throw error;
    }
  },

  // Get business hours
  async getBusinessHours(businessId: string): Promise<BusinessHours[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        BUSINESS_HOURS_COLLECTION_ID,
        [Query.equal("businessId", businessId)]
      );

      return result.documents as unknown as BusinessHours[];
    } catch (error) {
      console.error("Get business hours error:", error);
      throw error;
    }
  },
};
