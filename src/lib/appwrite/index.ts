import "dotenv/config";

import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Models,
  OAuthProvider,
  Query,
  Storage,
  Users,
  Role,
} from "node-appwrite";
import { cookies } from "next/headers";
import {
  User,
  Business,
  BusinessHours,
  BusinessImage,
  Review,
  ReviewReaction,
  Category,
  Message,
  Conversation,
  AuthSession,
} from "../schema";
import { createAdminClient } from "./admin";
import { create } from "domain";
import { createSessionClient } from "./session";

// Appwrite configuration
const client = new Client();

// Initialize the client
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

// Initialize services
const users = new Users(client);
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const avatars = new Avatars(client);

// Database constants
export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
export const USERS_COLLECTION_ID = "users";
export const BUSINESSES_COLLECTION_ID = "businesses";
export const BUSINESS_HOURS_COLLECTION_ID = "business_hours";
export const BUSINESS_IMAGES_COLLECTION_ID = "business_images";
export const REVIEWS_COLLECTION_ID = "reviews";
export const REVIEW_REACTIONS_COLLECTION_ID = "review_reactions";
export const CATEGORIES_COLLECTION_ID = "categories";
export const MESSAGES_COLLECTION_ID = "messages";
export const CONVERSATIONS_COLLECTION_ID = "conversations";
export const AUTH_SESSIONS_COLLECTION_ID = "auth_sessions";
export const BUSINESS_IMAGES_BUCKET_ID = "67fc0ef9000e1bba4e5d";
export const MESSAGE_IMAGES_BUCKET_ID = "67fc0ef9000e1bba4e5d";

// Auth Service
export const AuthService = {
  // Register a new user
  async register(
    email: string,
    password: string,
    name: string,
    phone?: string
  ): Promise<User> {
    try {
      // Create user account
      const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        name
      );

      // Create user profile in database
      const newUser = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        newAccount.$id,
        {
          phone,
          fullName: name,
          avatarUrl: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );

      return newUser as unknown as User;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  // Login existing user
  async login(email: string, password: string): Promise<{ success: boolean }> {
    try {
      const session = await account.createEmailPasswordSession(email, password);

      await cookies().then((cookies) => {
        cookies.set("cham_appwrite_session", session.secret, {
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
          sameSite: "strict",
          path: "/",
          maxAge: 60 * 60 * 24 * 365, // 1 year
        });
      });

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Login with Google
  async loginWithGoogle(redirectUrl: string): Promise<string> {
    try {
      return await account.createOAuth2Token(
        OAuthProvider.Google,
        redirectUrl,
        `${redirectUrl}?failure=true`
      );
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  },

  async completeOauth2Login(userId: string, secret: string) {
    try {
      try {
        // Check if user exists
        await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
      } catch {
        // Create user profile in database
        await databases.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userId,
          {
            phone: null,
            fullName: "",
            avatarUrl: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        );
      }

      const session = await account.createSession(userId, secret);
      await cookies().then((cookies) => {
        cookies.set("cham_appwrite_session", session.secret, {
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
          sameSite: "strict",
          path: "/",
          maxAge: 60 * 60 * 24 * 365, // 1 year
        });
      });

      return { success: true };
    } catch (error) {
      console.error("Oauthh sesion error:", error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser(): Promise<{
    user: Models.User<Models.Preferences>;
    profile: User;
  } | null> {
    try {
      const session = await cookies().then((cookies) =>
        cookies.get("cham_appwrite_session")
      );

      if (!session?.value) {
        return null;
      }

      const { account } = await createSessionClient(session.value);
      const user = await account.get();

      const profile = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        user.$id
      );

      return { user, profile } as unknown as {
        user: Models.User<Models.Preferences>;
        profile: User;
      };
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      const { account } = await createAdminClient();
      const session = await cookies().then((cookies) =>
        cookies.get("cham_appwrite_session")
      );

      if (!session?.value) {
        throw new Error("Unauthenticated user");
      }

      cookies().then((cookies) => cookies.delete("cham_appwrite_session"));

      account.deleteSession(session.value);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },
};

// User Service
export const UserService = {
  // Get user by ID
  async getUserById(userId: string): Promise<User> {
    try {
      const user = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId
      );

      return user as unknown as User;
    } catch (error) {
      console.error("Get user error:", error);
      throw error;
    }
  },

  // Update user profile
  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    try {
      const updatedUser = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          ...data,
          updatedAt: new Date().toISOString(),
        }
      );

      return updatedUser as unknown as User;
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    }
  },

  // Upload avatar
  async uploadAvatar(file: File, userId: string): Promise<string> {
    try {
      const result = await storage.createFile("avatars", ID.unique(), file);

      const fileUrl = storage.getFileView("avatars", result.$id);

      await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, userId, {
        avatarUrl: fileUrl.toString(),
        updatedAt: new Date().toISOString(),
      });

      return fileUrl.toString();
    } catch (error) {
      console.error("Upload avatar error:", error);
      throw error;
    }
  },
};

// Business Service
export const BusinessService = {
  // Create new business
  async createBusiness(
    data: Omit<
      Business,
      "$id" | "createdAt" | "updatedAt" | "rating" | "reviewCount"
    >,
    userId: string
  ): Promise<Business> {
    try {
      const newBusiness = await databases.createDocument(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        ID.unique(),
        {
          ...data,
          ownerId: userId,
          rating: 0,
          reviewCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
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
    data: Partial<Business>
  ): Promise<Business> {
    try {
      const updatedBusiness = await databases.updateDocument(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        businessId,
        {
          ...data,
          updatedAt: new Date().toISOString(),
        }
      );

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
  }: {
    categories?: string[];
    query?: string;
    location?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  }): Promise<{ businesses: Business[]; total: number }> {
    try {
      const filters = [];

      // Add category filter if categories are provided
      if (categories.length === 1) {
        filters.push(Query.equal("categories", categories[0]));
      }

      // Add name search if query is provided
      if (query) {
        filters.push(
          Query.or([
            Query.search("name", query),
            Query.search("description", query),
          ])
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

      // Get total count first
      const total = await databases.listDocuments(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        filters.length > 0 ? filters : undefined
      );

      // Now get paginated results
      const result = await databases.listDocuments(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        [
          ...(filters.length > 0 ? filters : []),
          Query.limit(limit),
          Query.offset(offset),
          sortDirection === "asc"
            ? Query.orderAsc(sortBy)
            : Query.orderDesc(sortBy),
        ]
      );

      return {
        businesses: result.documents as unknown as Business[],
        total: total.total,
      };
    } catch (error) {
      console.error("List businesses error:", error);
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
        if (!business.coordinates) return false;

        // Calculate distance (Haversine formula would be better in production)
        const latDiff = business.coordinates.latitude - latitude;
        const lngDiff = business.coordinates.longitude - longitude;
        const approxDistance =
          Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // rough conversion to km

        return approxDistance <= distance;
      });

      return nearbyBusinesses.slice(0, limit);
    } catch (error) {
      console.error("Get nearby businesses error:", error);
      throw error;
    }
  },
};

// Business Hours Service
export const BusinessHoursService = {
  // Add/update business hours
  async setBusinessHours(
    businessId: string,
    hours: Omit<BusinessHours, "$id">[]
  ): Promise<BusinessHours[]> {
    try {
      // Delete existing hours first
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
      for (const hour of hours) {
        const newHour = await databases.createDocument(
          DATABASE_ID,
          BUSINESS_HOURS_COLLECTION_ID,
          ID.unique(),
          {
            businessId,
            day: hour.day,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
            isClosed: hour.isClosed,
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

// Business Images Service
export const BusinessImagesService = {
  // Temporary upload image
  async uploadTempBusinessImage(
    file: File,
    userID: string
  ): Promise<BusinessImage> {
    console.log(file);
    try {
      const result = await storage.createFile(
        BUSINESS_IMAGES_BUCKET_ID,
        ID.unique(),
        file
      );

      const image = await databases.createDocument(
        DATABASE_ID,
        BUSINESS_IMAGES_COLLECTION_ID,
        result.$id,
        {
          businessId: userID,
          imageUrl: getImageURl(result.$id),
          title: file.name,
          isPrimary: false,
          createdAt: new Date().toISOString(),
          uploadedBy: userID,
        }
      );

      return image as unknown as BusinessImage;
    } catch (error) {
      console.error("Upload temp image error:", error);
      throw error;
    }
  },

  // Upload business image
  async uploadBusinessImage(
    businessId: string,
    file: File,
    title?: string,
    userID?: string,
    isPrimary: boolean = false
  ): Promise<BusinessImage> {
    try {
      // If this is primary, update any existing primary images
      if (isPrimary) {
        const existingPrimary = await databases.listDocuments(
          DATABASE_ID,
          BUSINESS_IMAGES_COLLECTION_ID,
          [
            Query.equal("businessId", businessId),
            Query.equal("isPrimary", true),
          ]
        );

        for (const doc of existingPrimary.documents) {
          await databases.updateDocument(
            DATABASE_ID,
            BUSINESS_IMAGES_COLLECTION_ID,
            doc.$id,
            { isPrimary: false }
          );
        }
      }

      const imageID = ID.unique();

      // Create image record
      const newImage = await databases.createDocument(
        DATABASE_ID,
        BUSINESS_IMAGES_COLLECTION_ID,
        imageID,
        {
          businessId,
          title: title || "",
          isPrimary,
          imageUrl: getImageURl(imageID),
          createdAt: new Date().toISOString(),
          uploadedBy: userID || null,
        }
      );

      // Upload file to storage
      await storage.createFile(BUSINESS_IMAGES_BUCKET_ID, newImage.$id, file);

      return newImage as unknown as BusinessImage;
    } catch (error) {
      console.error("Upload business image error:", error);
      throw error;
    }
  },

  async uploadTempImagesToBusiness(
    businessId: string,
    images: BusinessImage[]
  ): Promise<void> {
    // Verify business exists
    await BusinessService.getBusinessById(businessId);

    let hasPrimaryimage = false;
    for (const [index, image] of images.reverse().entries()) {
      hasPrimaryimage = !hasPrimaryimage
        ? image.isPrimary || index === images.length - 1
        : false;

      await databases.updateDocument(
        DATABASE_ID,
        BUSINESS_IMAGES_COLLECTION_ID,
        image.$id,
        {
          businessId,
          isPrimary: hasPrimaryimage,
        }
      );
    }
  },

  // Get business images
  async getBusinessImage(businessId: string): Promise<BusinessImage> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        BUSINESS_IMAGES_COLLECTION_ID,
        [Query.equal("businessId", businessId), Query.equal("isPrimary", true)]
      );

      if (result.documents.length < 1) {
        throw new Error("No primary business image");
      }

      return result.documents[0] as unknown as BusinessImage;
    } catch (error) {
      console.error("Get business images error:", error);
      throw error;
    }
  },

  async getBusinessImages(businessId: string): Promise<BusinessImage[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        BUSINESS_IMAGES_COLLECTION_ID,
        [Query.equal("businessId", businessId)]
      );

      return result.documents as unknown as BusinessImage[];
    } catch (error) {
      console.error("Get business images error:", error);
      throw error;
    }
  },

  // Delete business image
  async deleteBusinessImage(imageId: string): Promise<void> {
    try {
      const image = (await databases.getDocument(
        DATABASE_ID,
        BUSINESS_IMAGES_COLLECTION_ID,
        imageId
      )) as unknown as BusinessImage;

      // Extract file ID from imageUrl
      const url = new URL(image.imageUrl);
      const fileId = url.pathname.split("/").pop();

      if (fileId) {
        await storage.deleteFile(BUSINESS_IMAGES_BUCKET_ID, fileId);
      }

      await databases.deleteDocument(
        DATABASE_ID,
        BUSINESS_IMAGES_COLLECTION_ID,
        imageId
      );
    } catch (error) {
      console.error("Delete business image error:", error);
      throw error;
    }
  },
};

// Review Service
export const ReviewService = {
  // Create review
  async createReview(
    businessId: string,
    userId: string,
    rating: number,
    text: string,
    title?: string,
    recommendation?: string
  ): Promise<Review> {
    try {
      const newReview = await databases.createDocument(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        ID.unique(),
        {
          businessId,
          userId,
          rating,
          title: title || "",
          text,
          recommendation: recommendation || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likes: 0,
          dislikes: 0,
        }
      );

      // Update business average rating and review count
      await updateBusinessRating(businessId);

      return newReview as unknown as Review;
    } catch (error) {
      console.error("Create review error:", error);
      throw error;
    }
  },

  // Get reviews for a business
  async getBusinessReviews(
    businessId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<{ reviews: Review[]; total: number }> {
    try {
      // Get total count
      const total = await databases.listDocuments(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        [Query.equal("businessId", businessId)]
      );

      // Get paginated results
      const result = await databases.listDocuments(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        [
          Query.equal("businessId", businessId),
          Query.orderDesc("createdAt"),
          Query.limit(limit),
          Query.offset(offset),
        ]
      );

      return {
        reviews: result.documents as unknown as Review[],
        total: total.total,
      };
    } catch (error) {
      console.error("Get business reviews error:", error);
      throw error;
    }
  },

  // React to a review (like/dislike)
  async reactToReview(
    reviewId: string,
    userId: string,
    type: "like" | "dislike"
  ): Promise<void> {
    try {
      // Check if user already reacted
      const existingReaction = await databases.listDocuments(
        DATABASE_ID,
        REVIEW_REACTIONS_COLLECTION_ID,
        [Query.equal("reviewId", reviewId), Query.equal("userId", userId)]
      );

      // If there's an existing reaction, update it
      if (existingReaction.total > 0) {
        const reaction = existingReaction.documents[0];
        const oldType = reaction.type;

        // Only update if the reaction type is different
        if (oldType !== type) {
          await databases.updateDocument(
            DATABASE_ID,
            REVIEW_REACTIONS_COLLECTION_ID,
            reaction.$id,
            { type }
          );

          // Update the review counters
          await updateReviewReactionCounts(reviewId, oldType, type);
        }
      } else {
        // Create new reaction
        await databases.createDocument(
          DATABASE_ID,
          REVIEW_REACTIONS_COLLECTION_ID,
          ID.unique(),
          {
            reviewId,
            userId,
            type,
            createdAt: new Date().toISOString(),
          }
        );

        // Update the review counters
        const review = (await databases.getDocument(
          DATABASE_ID,
          REVIEWS_COLLECTION_ID,
          reviewId
        )) as unknown as Review;

        const updatedCounts = {
          likes: review.likes + (type === "like" ? 1 : 0),
          dislikes: review.dislikes + (type === "dislike" ? 1 : 0),
        };

        await databases.updateDocument(
          DATABASE_ID,
          REVIEWS_COLLECTION_ID,
          reviewId,
          updatedCounts
        );
      }
    } catch (error) {
      console.error("React to review error:", error);
      throw error;
    }
  },
};

// Helper to update business rating when reviews change
async function updateBusinessRating(businessId: string): Promise<void> {
  try {
    const reviews = await databases.listDocuments(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      [Query.equal("businessId", businessId)]
    );

    const total = reviews.total;
    let sum = 0;

    for (const review of reviews.documents) {
      sum += review.rating;
    }

    const avgRating = total > 0 ? sum / total : 0;

    await databases.updateDocument(
      DATABASE_ID,
      BUSINESSES_COLLECTION_ID,
      businessId,
      {
        rating: avgRating,
        reviewCount: total,
        updatedAt: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error("Update business rating error:", error);
    throw error;
  }
}

// Helper to update review reaction counts
async function updateReviewReactionCounts(
  reviewId: string,
  oldType: "like" | "dislike",
  newType: "like" | "dislike"
): Promise<void> {
  try {
    const review = (await databases.getDocument(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      reviewId
    )) as unknown as Review;

    const updatedCounts = {
      likes:
        review.likes +
        (oldType === "like" ? -1 : 0) +
        (newType === "like" ? 1 : 0),
      dislikes:
        review.dislikes +
        (oldType === "dislike" ? -1 : 0) +
        (newType === "dislike" ? 1 : 0),
    };

    await databases.updateDocument(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      reviewId,
      updatedCounts
    );
  } catch (error) {
    console.error("Update review reaction counts error:", error);
    throw error;
  }
}

// Category Service
export const CategoryService = {
  // Create category
  async createCategory(
    name: string,
    description?: string,
    imageUrl?: string,
    parentId?: string
  ): Promise<Category> {
    try {
      const newCategory = await databases.createDocument(
        DATABASE_ID,
        CATEGORIES_COLLECTION_ID,
        ID.unique(),
        {
          name,
          description: description || "",
          imageUrl: imageUrl || "",
          parentId: parentId || null,
        }
      );

      return newCategory as unknown as Category;
    } catch (error) {
      console.error("Create category error:", error);
      throw error;
    }
  },

  // Get all categories
  async getAllCategories(): Promise<Category[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        CATEGORIES_COLLECTION_ID
      );

      return result.documents as unknown as Category[];
    } catch (error) {
      console.error("Get all categories error:", error);
      throw error;
    }
  },

  // Get category by ID
  async getCategoryById(categoryId: string): Promise<Category> {
    try {
      const category = await databases.getDocument(
        DATABASE_ID,
        CATEGORIES_COLLECTION_ID,
        categoryId
      );

      return category as unknown as Category;
    } catch (error) {
      console.error("Get category error:", error);
      throw error;
    }
  },
};

// Message Service
export const MessageService = {
  // Send message
  async sendMessage(
    conversationId: string,
    senderId: string,
    text?: string,
    image?: File
  ): Promise<Message> {
    try {
      let imageUrl = "";
      let imageName = "";
      let imageSize = "";

      // Upload image if provided
      if (image) {
        const fileResult = await storage.createFile(
          MESSAGE_IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );

        imageUrl = storage
          .getFileView(MESSAGE_IMAGES_BUCKET_ID, fileResult.$id)
          .toString();
        imageName = image.name;
        imageSize = formatBytes(image.size);
      }

      // Create message
      const newMessage = await databases.createDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        ID.unique(),
        {
          conversationId,
          senderId,
          text: text || "",
          imageUrl: imageUrl || "",
          imageName: imageName || "",
          imageSize: imageSize || "",
          isRead: false,
          createdAt: new Date().toISOString(),
        }
      );

      // Update conversation with last message ID
      await databases.updateDocument(
        DATABASE_ID,
        CONVERSATIONS_COLLECTION_ID,
        conversationId,
        {
          lastMessageId: newMessage.$id,
          updatedAt: new Date().toISOString(),
        }
      );

      return newMessage as unknown as Message;
    } catch (error) {
      console.error("Send message error:", error);
      throw error;
    }
  },

  // Get messages for a conversation
  async getConversationMessages(
    conversationId: string,
    limit: number = 30,
    offset: number = 0
  ): Promise<Message[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        [
          Query.equal("conversationId", conversationId),
          Query.orderDesc("createdAt"), // Most recent first
          Query.limit(limit),
          Query.offset(offset),
        ]
      );

      return result.documents as unknown as Message[];
    } catch (error) {
      console.error("Get conversation messages error:", error);
      throw error;
    }
  },

  // Mark messages as read
  async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    try {
      const unreadMessages = await databases.listDocuments(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        [
          Query.equal("conversationId", conversationId),
          Query.equal("isRead", false),
          Query.notEqual("senderId", userId), // Only mark messages from other users
        ]
      );

      for (const message of unreadMessages.documents) {
        await databases.updateDocument(
          DATABASE_ID,
          MESSAGES_COLLECTION_ID,
          message.$id,
          { isRead: true }
        );
      }
    } catch (error) {
      console.error("Mark messages as read error:", error);
      throw error;
    }
  },
};

// Conversation Service
export const ConversationService = {
  // Create or get conversation between users
  async getOrCreateConversation(userIds: string[]): Promise<Conversation> {
    try {
      // Sort user IDs to ensure consistent lookup
      const sortedUserIds = [...userIds].sort();

      // Check if conversation already exists
      const conversations = await databases.listDocuments(
        DATABASE_ID,
        CONVERSATIONS_COLLECTION_ID
      );

      // Client-side filtering for participants match
      for (const conv of conversations.documents) {
        // Sort participants for comparison
        const sortedParticipants = [...conv.participants].sort();
        if (
          sortedParticipants.length === sortedUserIds.length &&
          sortedParticipants.every((id, index) => id === sortedUserIds[index])
        ) {
          return conv as unknown as Conversation;
        }
      }

      // If no conversation exists, create one
      const newConversation = await databases.createDocument(
        DATABASE_ID,
        CONVERSATIONS_COLLECTION_ID,
        ID.unique(),
        {
          participants: sortedUserIds,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );

      return newConversation as unknown as Conversation;
    } catch (error) {
      console.error("Get or create conversation error:", error);
      throw error;
    }
  },

  // Get user conversations
  async getUserConversations(userId: string): Promise<{
    conversations: Conversation[];
    lastMessages: Record<string, Message>;
    unreadCounts: Record<string, number>;
    participants: Record<string, User[]>;
  }> {
    try {
      // Get all conversations
      const conversations = await databases.listDocuments(
        DATABASE_ID,
        CONVERSATIONS_COLLECTION_ID
      );

      // Filter by user's participation (client-side)
      const userConversations = conversations.documents.filter((conv) =>
        conv.participants.includes(userId)
      ) as unknown as Conversation[];

      // Get last messages for each conversation
      const lastMessages: Record<string, Message> = {};
      const unreadCounts: Record<string, number> = {};
      const participants: Record<string, User[]> = {};

      for (const conv of userConversations) {
        // Get last message
        if (conv.lastMessageId) {
          try {
            const lastMessage = await databases.getDocument(
              DATABASE_ID,
              MESSAGES_COLLECTION_ID,
              conv.lastMessageId
            );
            lastMessages[conv.$id] = lastMessage as unknown as Message;
          } catch (e) {
            console.error(
              `Error fetching last message for conversation ${conv.$id}:`,
              e
            );
          }
        }

        // Count unread messages
        const unreadQuery = await databases.listDocuments(
          DATABASE_ID,
          MESSAGES_COLLECTION_ID,
          [
            Query.equal("conversationId", conv.$id),
            Query.equal("isRead", false),
            Query.notEqual("senderId", userId),
          ]
        );

        unreadCounts[conv.$id] = unreadQuery.total;

        // Get other participants' info
        const otherParticipantIds = conv.participants.filter(
          (id) => id !== userId
        );
        const otherParticipants: User[] = [];

        for (const participantId of otherParticipantIds) {
          try {
            const user = await databases.getDocument(
              DATABASE_ID,
              USERS_COLLECTION_ID,
              participantId
            );
            otherParticipants.push(user as unknown as User);
          } catch (e) {
            console.error(`Error fetching user ${participantId}:`, e);
          }
        }

        participants[conv.$id] = otherParticipants;
      }

      return {
        conversations: userConversations,
        lastMessages,
        unreadCounts,
        participants,
      };
    } catch (error) {
      console.error("Get user conversations error:", error);
      throw error;
    }
  },
};

// Helper function to format bytes
function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function getImageURl(imageID: string) {
  return `https://cloud.appwrite.io/v1/storage/buckets/${BUSINESS_IMAGES_BUCKET_ID}/files/${imageID}/view?project=${process.env.APPWRITE_PROJECT_ID}`;
}

// Export client for direct use in components when needed
export { client, account, databases, storage, avatars };
