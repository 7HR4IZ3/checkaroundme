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
    price, // Add price filter
    features = [], // Add features filter
    distances = [], // Add distances filter (Note: Distance filtering logic is complex and not fully implemented here)
  }: {
    categories?: string[];
    query?: string;
    location?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    price?: string; // e.g., "$1000"
    features?: string[]; // e.g., ["wifi", "cash"]
    distances?: string[]; // e.g., ["within_5km"]
  }): Promise<{ businesses: Business[]; total: number }> {
    const filters: string[] = []; // Ensure filters is explicitly typed as string[]
    try {
      // Add category filter if categories are provided
      if (categories.length > 0) {
        // Assuming categories is an array of IDs. Appwrite might require Query.equal for single or Query.contains if it's an array attribute
        // If 'categories' attribute in Appwrite is an array of strings:
        filters.push(Query.contains("categories", categories)); // Use contains for array matching
        // If 'categories' is a single string attribute and you want to match any in the list:
        // filters.push(Query.equal("categories", categories)); // This might need adjustment based on schema
      }

      // Add name/about search if query is provided
      if (query) {
        filters.push(
          Query.or([Query.search("name", query), Query.search("about", query)])
        );
      }

      // Add location search if location is provided
      if (location) {
        filters.push(
          Query.or([
            Query.search("addressLine1", location),
            Query.search("addressLine2", location),
            Query.search("city", location),
            Query.search("state", location),
            Query.search("country", location),
          ])
        );
      }

      // Add price filter (less than or equal to)
      if (price) {
        const priceValue = parseInt(price.replace(/[^0-9]/g, ""), 10); // Extract number
        if (!isNaN(priceValue)) {
          // Assuming 'priceIndicator' stores a comparable numeric value or string that can be compared
          // If priceIndicator stores strings like "$10", direct comparison might not work as expected.
          // This requires the 'priceIndicator' attribute in Appwrite to be a number for '<=' to work correctly.
          // If 'priceIndicator' is a string, this filter might need adjustment or backend data transformation.
          // For now, assuming it's a number or comparable string:
          filters.push(Query.lessThanEqual("priceIndicator", priceValue)); // Placeholder - adjust based on actual schema type
        }
      }

      // Add features filters
      features.forEach((feature) => {
        switch (feature) {
          case "on_site_parking":
          case "garage_parking":
          case "wifi":
            filters.push(Query.equal(feature, true));
            break;
          case "bank_transfers":
          case "cash":
            filters.push(Query.contains("paymentOptions", feature));
            break;
          case "open_now":
            // TODO: Implement complex 'open_now' logic. Requires checking current time against BusinessHours.
            // This likely needs to be done post-query or with a more complex backend setup.
            console.warn("'open_now' filter not implemented in this query.");
            break;
          default:
            console.warn(`Unknown feature filter: ${feature}`);
        }
      });

      // TODO: Implement distance filtering. This is complex with Appwrite's basic queries.
      // It might require fetching based on broader location and then filtering by coordinates,
      // or using Appwrite's geospatial capabilities if configured.
      if (distances.length > 0) {
        console.warn("Distance filtering not implemented in this query.");
      }

      // console.log("Appwrite Filters:", filters);
      // console.log("Pagination:", limit, offset);

      // Now get paginated results
      const result = await databases.listDocuments(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        [
          ...filters, // Spread the filters array
          Query.limit(limit),
          Query.offset(offset),
          sortDirection === "asc"
            ? Query.orderAsc(sortBy)
            : Query.orderDesc(sortBy),
        ]
      );

      return {
        businesses: result.documents as unknown as Business[],
        total: result.total,
      };
    } catch (error) {
      console.error("List businesses error:", error);
      // If error is due to invalid query (e.g., bad attribute name), log more details
      if (error instanceof Error && error.message.includes("Query")) {
        console.error("Appwrite query details:", filters);
      }
      throw error;
    }
  },

  // Get nearby businesses
  async getNearbyBusinesses(
    latitude: number,
    longitude: number,
    distance: number = 10, // in kilometers
    limit: number = 10
  ): Promise<Business[]> {
    try {
      // This is a simplified implementation. In a production system,
      // you would use a geospatial query or a dedicated geospatial service.
      // For Appwrite, we'll use a combination of filters to approximate this.

      // With Appwrite, you might need to retrieve all documents and filter on the client side
      // or implement a cloud function that handles more complex geospatial queries
      const result = await databases.listDocuments(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        [
          Query.limit(limit * 5), // Get more than we need to filter
          Query.orderDesc("rating"), // Sort by rating as a fallback
        ]
      );

      // Client-side filtering based on coordinates
      const businesses = result.documents as unknown as Business[];

      // Filter businesses by distance (simplified version)
      const nearbyBusinesses = businesses.filter((business) => {
        // if (!business.coordinates) return false;

        // // Calculate distance (Haversine formula would be better in production)
        // const latDiff = business.coordinates.latitude - latitude;
        // const lngDiff = business.coordinates.longitude - longitude;
        // const approxDistance =
        //   Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 11100; // rough conversion to km

        // return approxDistance <= distance;
        return true;
      });

      return nearbyBusinesses.slice(0, limit);
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
