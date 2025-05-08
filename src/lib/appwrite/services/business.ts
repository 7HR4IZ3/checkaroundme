import { ID, Query, Models } from "node-appwrite";
import axios, { AxiosError } from "axios";

import {
  Business,
  BusinessHours,
  BusinessImage,
  Review,
  ReviewReaction,
  Category,
  Message,
  Conversation,
  AuthSession,
  DaySchema,
} from "../../schema"; // Corrected schema import path

import {
  databases,
  BUSINESSES_COLLECTION_ID,
  DATABASE_ID,
  BUSINESS_HOURS_COLLECTION_ID,
  BUSINESS_IMAGES_COLLECTION_ID,
} from "../index"; // Assuming databases and constants remain in index.ts
import { BusinessHoursService } from "./business-hours"; // Assuming BusinessHoursService will be in its own file
import { BusinessImagesService } from "./business-images"; // Assuming BusinessImagesService will be in its own file

// Helper function to calculate Haversine distance between two points
function getHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Helper function to check if a business is currently open
// Assumes BusinessHoursService.getBusinessHours(businessId) exists and returns BusinessHours or null
async function checkOpenNow(
  business: Business,
  currentTime: Date
): Promise<boolean> {
  try {
    const hoursDoc = await BusinessHoursService.getBusinessHours(business.$id);
    if (!hoursDoc) return false;

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const currentDayName = dayNames[currentTime.getDay()].toLowerCase();
    const todayHours = hoursDoc.find((hours) => {
      return hours.day === currentDayName;
    });

    if (!todayHours || !todayHours.openTime || !todayHours.closeTime) {
      return false;
    }

    if (todayHours.isClosed) {
      return false;
    }

    const [openHour, openMinute] = todayHours.openTime.split(":").map(Number);
    const [closeHour, closeMinute] = todayHours.closeTime
      .split(":")
      .map(Number);

    const currentTotalMinutes =
      currentTime.getHours() * 60 + currentTime.getMinutes();
    const openTotalMinutes = openHour * 60 + openMinute;
    let closeTotalMinutes = closeHour * 60 + closeMinute;

    // Handle 24-hour open case e.g. open "00:00", close "00:00" or "23:59"
    if (
      openTotalMinutes === 0 &&
      (closeTotalMinutes === 0 || closeTotalMinutes === 24 * 60 - 1)
    ) {
      return true;
    }

    if (closeTotalMinutes <= openTotalMinutes) {
      // Spans midnight (e.g., open 22:00, close 02:00)
      return (
        currentTotalMinutes >= openTotalMinutes ||
        currentTotalMinutes < closeTotalMinutes
      );
    } else {
      // Closes same day (e.g., open 09:00, close 17:00)
      return (
        currentTotalMinutes >= openTotalMinutes &&
        currentTotalMinutes < closeTotalMinutes
      );
    }
  } catch (error) {
    console.warn(
      `Could not determine if business ${business.$id} is open due to error:`,
      error
    );
    return false; // Assume closed on error
  }
}

// Business Service
export const BusinessService = {
  // Create new business
  async createBusiness(
    data: Omit<
      Business,
      "$id" | "createdAt" | "updatedAt" | "rating" | "reviewCount"
    >,
    userId: string,
    hours: { [key: string]: DaySchema },
    images: { isPrimary: boolean; imageID: string }[]
  ): Promise<Business> {
    try {
      let coordinates = undefined;
      const address = `${data.addressLine1}, ${data.city}, ${
        data.state || ""
      }, ${data.country || ""}, ${data.postalCode || ""}`;
      try {
        const geocodeResponse = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: address,
              format: "json",
              limit: 1,
            },
            headers: {
              "User-Agent": "CheckAroundMe/1.0 (contact@checkaroundme.com)", // Replace with your app name and contact
            },
          }
        );

        if (geocodeResponse.data && geocodeResponse.data.length > 0) {
          const result = geocodeResponse.data[0];
          coordinates = JSON.stringify({
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
          });
          console.log(`Geocoded address "${address}" to`, coordinates);
        } else {
          console.warn(
            `Could not geocode address: "${address}". No results found.`
          );
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(
            `Geocoding API error: ${error.message}`,
            error.response?.data
          );
        } else {
          console.error(
            "An unexpected error occurred during geocoding:",
            error
          );
        }
        // Continue without coordinates if geocoding fails
      }

      // Add coordinates to the data object if available
      const businessDataWithCoordinates = coordinates
        ? { ...data, coordinates }
        : data;
      const newBusiness = await databases.createDocument(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        ID.unique(),
        {
          ...businessDataWithCoordinates,
          rating: 0,
          reviewCount: 0,
          ownerId: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );

      await BusinessHoursService.setBusinessHours(newBusiness.$id, hours);

      await BusinessImagesService.uploadTempImagesToBusiness(
        newBusiness.$id,
        images
      );

      return newBusiness as unknown as Business;
    } catch (error) {
      console.error("Create business error:", error);
      throw error;
    }
  },

  // Get business by ID
  async getBusinessById(businessId: string): Promise<Business> {
    try {
      const business = await databases.getDocument(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        businessId
      );

      return business as unknown as Business;
    } catch (error) {
      console.error("Get business error:", error);
      throw error;
    }
  },

  // Update business
  async updateBusiness(
    businessId: string,
    data: Partial<Business> & {
      hours?: { [key: string]: DaySchema };
      images?: { isPrimary: boolean; imageID: string }[];
    }
  ): Promise<Business> {
    const { hours, images, ...business } = data;
    try {
      const updatedBusiness = await databases.updateDocument(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        businessId,
        {
          ...business,
          updatedAt: new Date().toISOString(),
        }
      );

      hours &&
        (await BusinessHoursService.setBusinessHours(
          updatedBusiness.$id,
          hours
        ));
      images &&
        (await BusinessImagesService.uploadTempImagesToBusiness(
          updatedBusiness.$id,
          images
        ));

      return updatedBusiness as unknown as Business;
    } catch (error) {
      console.error("Update business error:", error);
      throw error;
    }
  },

  // List businesses with filtering options
  async listBusinesses({
    categories = [],
    query = "",
    location = "",
    limit = 10,
    offset = 0,
    sortBy = "rating",
    sortDirection = "desc", // 'asc' or 'desc'
    price,
    features = [],
    openNow, // New filter: boolean
    userLatitude, // New filter: number
    userLongitude, // New filter: number
    maxDistanceKm, // New filter: number (e.g., 5 for 5km)
  }: {
    categories?: string[];
    query?: string;
    location?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    price?: string;
    features?: string[];
    openNow?: boolean;
    userLatitude?: number;
    userLongitude?: number;
    maxDistanceKm?: number;
  }): Promise<{ businesses: Business[]; total: number }> {
    const appwriteFilters: string[] = [];
    try {
      if (categories.length > 0) {
        appwriteFilters.push(Query.contains("categories", categories));
      }

      if (query) {
        appwriteFilters.push(
          Query.or([Query.search("name", query), Query.search("about", query)])
        );
      }

      if (location) {
        appwriteFilters.push(
          Query.or([
            Query.search("addressLine1", location),
            Query.search("addressLine2", location),
            Query.search("city", location),
            Query.search("state", location),
            Query.search("country", location),
          ])
        );
      }

      if (price) {
        const priceValue = parseInt(price.replace(/[^0-9]/g, ""), 10);
        if (!isNaN(priceValue)) {
          appwriteFilters.push(
            Query.lessThanEqual("priceIndicator", priceValue)
          );
        }
      }

      features.forEach((feature) => {
        switch (feature) {
          case "on_site_parking":
          case "garage_parking":
          case "wifi":
            appwriteFilters.push(Query.equal(feature, true));
            break;
          case "bank_transfers":
          case "cash":
            appwriteFilters.push(Query.contains("paymentOptions", feature));
            break;
          // "open_now" is handled by a dedicated parameter and post-filtering
          default:
            console.warn(`Unknown feature filter: ${feature}`);
        }
      });

      const queryOptions = [
        ...appwriteFilters,
        Query.limit(limit),
        Query.offset(offset),
      ];

      sortBy != "distance" &&
        queryOptions.push(
          sortDirection === "asc"
            ? Query.orderAsc(sortBy)
            : Query.orderDesc(sortBy)
        );

      const result = await databases.listDocuments(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        queryOptions
      );

      let processedBusinesses = result.documents as unknown as Business[];
      const appwriteTotal = result.total;

      // Post-query filtering for "openNow" and "distance"
      // Note: This affects pagination accuracy as 'appwriteTotal' is pre-filter.

      // 1. Filter by "Open Now" if requested
      if (openNow) {
        const currentTime = new Date();
        const openBusinessesPromises = processedBusinesses.map(
          async (business) => ({
            business,
            isOpen: await checkOpenNow(business, currentTime),
          })
        );
        const openBusinessesResults = await Promise.all(openBusinessesPromises);
        processedBusinesses = openBusinessesResults
          .filter((res) => res.isOpen)
          .map((res) => res.business);
      }

      // 2. Filter by distance if requested
      if (
        userLatitude !== undefined &&
        userLongitude !== undefined &&
        maxDistanceKm !== undefined &&
        maxDistanceKm > 0
      ) {
        processedBusinesses = processedBusinesses.filter((business) => {
          if (
            !business.coordinates ||
            typeof business.coordinates !== "string"
          ) {
            return false;
          }
          try {
            const coords = JSON.parse(business.coordinates);
            if (
              typeof coords.latitude !== "number" ||
              typeof coords.longitude !== "number"
            ) {
              return false;
            }
            const distance = getHaversineDistance(
              userLatitude,
              userLongitude,
              coords.latitude,
              coords.longitude
            );
            return distance <= maxDistanceKm;
          } catch (e) {
            console.warn(
              `Error parsing coordinates for business ${business.$id}: ${business.coordinates}`,
              e
            );
            return false;
          }
        });
      }

      // 3. Sory by distance
      if (sortBy === "distance" && userLatitude && userLongitude) {
        processedBusinesses = processedBusinesses.sort((a, b) => {
          if (!a.coordinates || !b.coordinates) {
            return 0;
          }
          const aCoords = JSON.parse(a.coordinates);
          const bCoords = JSON.parse(b.coordinates);
          const distanceA = getHaversineDistance(
            userLatitude,
            userLongitude,
            aCoords.latitude,
            aCoords.longitude
          );
          const distanceB = getHaversineDistance(
            userLatitude,
            userLongitude,
            bCoords.latitude,
            bCoords.longitude
          );
          return distanceA - distanceB;
        });
      }

      return {
        businesses: processedBusinesses,
        total: appwriteTotal, // This total is from Appwrite before openNow/distance filters.
      };
    } catch (error) {
      console.error("List businesses error:", error);
      if (error instanceof Error && error.message.includes("Query")) {
        console.error("Appwrite query details:", appwriteFilters);
      }
      throw error;
    }
  },

  // Get nearby businesses
  async getNearbyBusinesses(
    latitude: number,
    longitude: number,
    distanceKm: number = 10, // Renamed for clarity, in kilometers
    limit: number = 10
  ): Promise<Business[]> {
    try {
      // Fetch a larger set of businesses to filter client-side.
      // Consider Appwrite's default query limit (100) or adjust if needed.
      const result = await databases.listDocuments(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        [
          Query.limit(Math.min(limit * 5, 100)), // Fetch more, up to 100 (Appwrite default max)
          Query.orderDesc("rating"), // Example sorting
        ]
      );

      const businesses = result.documents as unknown as Business[];

      const nearbyBusinesses = businesses
        .filter((business) => {
          if (
            !business.coordinates ||
            typeof business.coordinates !== "string"
          ) {
            return false;
          }
          try {
            const coords = JSON.parse(business.coordinates);
            if (
              typeof coords.latitude !== "number" ||
              typeof coords.longitude !== "number"
            ) {
              return false;
            }
            const dist = getHaversineDistance(
              latitude,
              longitude,
              coords.latitude,
              coords.longitude
            );
            return dist <= distanceKm;
          } catch (e) {
            console.warn(
              `Error parsing coordinates for business ${business.$id} in getNearbyBusinesses: ${business.coordinates}`,
              e
            );
            return false;
          }
        })
        .slice(0, limit);

      return nearbyBusinesses;
    } catch (error) {
      console.error("Get nearby businesses error:", error);
      throw error;
    }
  },

  // Get businesses by user ID
  async getBusinessesByUserId(userId: string): Promise<Business[]> {
    try {
      const { documents: businesses } = await databases.listDocuments(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        [Query.equal("ownerId", userId)]
      );

      return businesses as unknown as Business[];
    } catch (error) {
      console.error("Get businesses by user ID error:", error);
      throw error;
    }
  },
};
