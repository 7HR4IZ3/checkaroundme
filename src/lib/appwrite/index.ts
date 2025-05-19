import "dotenv/config";

import {
  Avatars,
  Client,
  Databases,
  ID,
  Models,
  Query,
  Storage,
  Users,
  Role,
  Account,
} from "node-appwrite";
import { cookies } from "next/headers";
import {
  User,
  Business,
  Review,
  ReviewReaction,
  Category,
  Message,
  Conversation,
  UserSettings,
  userSettingsSchema,
  UserSubscription,
  userSubscriptionSchema,
  PaymentTransaction,
  AnonymousSubmission,
} from "../schema";

// Import AuthService to get the current authenticated user for verification
import { AuthService } from "./services/auth";
import { createAdminClient } from "./admin";
import { createSessionClient } from "./session";
import axios, { AxiosError } from "axios"; // Keep axios here as BusinessService still needs it
import { randomInt, randomUUID } from "crypto";

// Appwrite configuration
const client = new Client();

// Initialize the client
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

// Initialize services
const users = new Users(client);
const databases = new Databases(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const account = new Account(client);

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
export const PAYMENT_TRANSACTIONS_COLLECTION_ID = "payment_transactions";
export const MAILING_LIST_COLLECTION_ID = "mailing_list";
export const ANONYMOUS_SUBMISSIONS_COLLECTION_ID = "anonymous_submissions";

export const BUSINESS_IMAGES_BUCKET_ID = "67fc0ef9000e1bba4e5d";
export const MESSAGE_IMAGES_BUCKET_ID = "67fc0ef9000e1bba4e5d";
export const AVATAR_IMAGES_BUCKET_ID = "67fc0ef9000e1bba4e5d";
export const ANONYMOUS_SUBMISSIONS_BUCKET_ID = "67fc0ef9000e1bba4e5d";

// User Service
export const UserService = {
  // Get user by ID
  async getUserById(userId: string): Promise<Models.User<Models.Preferences>> {
    try {
      const user = await users.get(userId);
      return user;
    } catch (error) {
      console.error("Get user error:", error);
      throw error;
    }
  },

  // Update user profile
  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const currentUserData = await AuthService.getCurrentUser();
    if (!currentUserData || currentUserData.user.$id !== userId) {
      // It's good practice to throw a specific error type or use a custom error class
      // For now, a generic error with a clear message.
      const error = new Error(
        "Unauthorized: You can only update your own profile."
      );
      (error as any).code = 403; // Forbidden
      throw error;
    }
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
    const currentUserData = await AuthService.getCurrentUser();
    if (!currentUserData || currentUserData.user.$id !== userId) {
      const error = new Error(
        "Unauthorized: You can only upload your own avatar."
      );
      (error as any).code = 403; // Forbidden
      throw error;
    }

    try {
      try {
        const existing = await storage.getFile(AVATAR_IMAGES_BUCKET_ID, userId);
        if (existing) {
          await storage.deleteFile(AVATAR_IMAGES_BUCKET_ID, userId);
        }
      } catch {}

      await storage.createFile(AVATAR_IMAGES_BUCKET_ID, userId, file);
      const fileUrl = getImageURl(userId);

      // Update the user document in the 'users' collection
      await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, userId, {
        avatarUrl: fileUrl,
        updatedAt: new Date().toISOString(),
      });

      return fileUrl;
    } catch (error) {
      console.error("Upload avatar error:", error);
      throw error;
    }
  },

  // Get User Settings
  async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      const user = await users.get(userId);
      // Ensure prefs exist and parse, otherwise return default
      return userSettingsSchema.parse(user.prefs || {});
    } catch (error) {
      console.error(`Get user settings error for ${userId}:`, error);
      // If user not found or other error, could return default or throw
      // For now, let's assume if prefs are empty/missing, it's like default.
      // Appwrite get() throws if user not found.
      // If prefs specifically are the issue, parse({}) handles it.
      if (error instanceof Error && (error as any).code === 404) {
        // Appwrite specific error for not found
        return userSettingsSchema.parse({}); // Return default if user prefs don't exist
      }
      throw error; // Re-throw other errors
    }
  },

  // Update User Settings
  async updateUserSettings(
    userId: string,
    data: UserSettings
  ): Promise<Models.Preferences> {
    const currentUserData = await AuthService.getCurrentUser();
    if (!currentUserData || currentUserData.user.$id !== userId) {
      const error = new Error(
        "Unauthorized: You can only update your own settings."
      );
      (error as any).code = 403; // Forbidden
      throw error;
    }
    try {
      const updatedPrefs = await users.updatePrefs(userId, data);
      return updatedPrefs;
    } catch (error) {
      console.error(`Update user settings error for ${userId}:`, error);
      throw error;
    }
  },

  // Update User Subscription Status (integrated from services/user.ts)
  async updateUserSubscriptionStatus(
    userId: string,
    subscriptionData: {
      subscriptionStatus: "active" | "inactive" | "cancelled";
      planCode: string;
      subscriptionExpiry: Date;
      paystackCustomerId?: string;
      paystackSubscriptionCode?: string | null;
    }
  ): Promise<Models.Preferences> {
    // This check assumes the update is initiated by the user themselves.
    // If triggered by a webhook (server-to-server), this check would be different or omitted,
    // relying on webhook secret verification instead.
    const currentUserData = await AuthService.getCurrentUser();
    if (!currentUserData || currentUserData.user.$id !== userId) {
      const error = new Error(
        "Unauthorized: You can only update your own subscription status."
      );
      (error as any).code = 403; // Forbidden
      throw error;
    }
    console.log(`Updating subscription for user ${userId}:`, subscriptionData);
    try {
      const dataToUpdate = {
        ...subscriptionData,
        subscriptionExpiry: subscriptionData.subscriptionExpiry.toISOString(),
      };
      const filteredData = Object.fromEntries(
        Object.entries(dataToUpdate).filter(([_, v]) => v != null)
      );
      // Store under a specific key in prefs, e.g., 'subscription'
      const prefsToUpdate = { subscription: filteredData };
      const updatedUser = await users.updatePrefs(userId, prefsToUpdate);
      console.log(`Successfully updated subscription prefs for user ${userId}`);
      return updatedUser;
    } catch (error: any) {
      console.error(
        `Failed to update subscription status for user ${userId}:`,
        error
      );
      if (error.response) {
        console.error("Appwrite error response:", error.response);
      }
      throw new Error(`Failed to update user subscription: ${error.message}`);
    }
  },

  // Get User Subscription
  async getUserSubscription(userId: string): Promise<UserSubscription> {
    try {
      const user = await users.get(userId);
      const subscriptionPrefs = user.prefs;
      console.log(subscriptionPrefs);
      return userSubscriptionSchema.parse(subscriptionPrefs);
    } catch (error) {
      console.error(`Get user subscription error for ${userId}:`, error);
      if (error instanceof Error && (error as any).code === 404) {
        return userSubscriptionSchema.parse({}); // Return default if user or prefs don't exist
      }
      throw error;
    }
  },

  // Get Payment History
  async getPaymentHistory(
    userId: string,
    limit: number = 10,
    cursor?: string
  ): Promise<{
    transactions: PaymentTransaction[];
    total: number;
    nextCursor?: string;
  }> {
    try {
      const queries = [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ];
      if (cursor) {
        queries.push(Query.cursorAfter(cursor));
      }

      const result = await databases.listDocuments(
        DATABASE_ID,
        PAYMENT_TRANSACTIONS_COLLECTION_ID,
        queries
      );

      const transactions = result.documents as unknown as PaymentTransaction[];

      // Determine if there's a next page for cursor-based pagination
      // If we fetched 'limit' items and there are more than 'limit' items in this batch,
      // the last item's ID can be the next cursor.
      // Appwrite's listDocuments doesn't directly give a 'nextCursor', so we infer.
      let nextCursor: string | undefined = undefined;
      if (transactions.length === limit && result.total > transactions.length) {
        // A simple way: if we got 'limit' items, there might be more.
        // For robust cursor pagination, Appwrite typically expects you to use the ID of the last document fetched.
        if (transactions.length > 0) {
          nextCursor = transactions[transactions.length - 1].$id;
        }
      }

      return {
        transactions,
        total: result.total,
        nextCursor,
      };
    } catch (error) {
      console.error(`Get payment history error for ${userId}:`, error);
      throw error;
    }
  },
};

// Review Service
export const ReviewService = {
  // Create new review (handles both top-level and replies)
  async createReview({
    businessId,
    userId,
    rating,
    text,
    title,
    recommendation,
    parentReviewId, // Added parentReviewId
  }: Omit<Review, "$id" | "createdAt" | "updatedAt" | "likes" | "dislikes"> & {
    parentReviewId?: string;
  }): Promise<Review> {
    try {
      const newReview = await databases.createDocument(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        ID.unique(),
        {
          // Data object
          businessId,
          userId,
          rating,
          text,
          title,
          recommendation,
          likes: 0,
          parentReviewId, // Include parentReviewId
          dislikes: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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
      // Get paginated results
      const result = await databases.listDocuments(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        [
          Query.equal("businessId", businessId),
          Query.isNull("parentReviewId"),
          Query.orderDesc("createdAt"),
          Query.limit(limit),
          Query.offset(offset),
        ]
      );

      return {
        reviews: result.documents as unknown as Review[],
        total: result.total,
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
  ): Promise<{
    likes: number;
    dislikes: number;
    userReactionType: "like" | "dislike" | null;
  }> {
    try {
      // Check if user already reacted
      const existingReaction = await databases.listDocuments(
        DATABASE_ID,
        REVIEW_REACTIONS_COLLECTION_ID,
        [Query.equal("reviewId", reviewId), Query.equal("userId", userId)]
      );

      let currentLikes = 0;
      let currentDislikes = 0;
      let userReactionType: "like" | "dislike" | null = null;

      // Fetch current review counts
      const review = (await databases.getDocument(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        reviewId
      )) as unknown as Review;
      currentLikes = review.likes;
      currentDislikes = review.dislikes;

      // If there's an existing reaction
      if (existingReaction.total > 0) {
        const reaction = existingReaction.documents[0];
        const oldType = reaction.type;

        // If the new reaction is the same as the old one, remove the reaction
        if (oldType === type) {
          await databases.deleteDocument(
            DATABASE_ID,
            REVIEW_REACTIONS_COLLECTION_ID,
            reaction.$id
          );
          if (oldType === "like") {
            currentLikes--;
          } else {
            currentDislikes--;
          }
          userReactionType = null;
        } else {
          // If the new reaction is different, update the existing reaction
          await databases.updateDocument(
            DATABASE_ID,
            REVIEW_REACTIONS_COLLECTION_ID,
            reaction.$id,
            { type }
          );
          if (oldType === "like") {
            currentLikes--;
            currentDislikes++;
          } else {
            currentDislikes--;
            currentLikes++;
          }
          userReactionType = type;
        }
      } else {
        // If no existing reaction, create a new one
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
        if (type === "like") {
          currentLikes++;
        } else {
          currentDislikes++;
        }
        userReactionType = type;
      }

      // Update the review document with the new counts
      await databases.updateDocument(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        reviewId,
        {
          likes: currentLikes,
          dislikes: currentDislikes,
        }
      );

      return {
        likes: currentLikes,
        dislikes: currentDislikes,
        userReactionType,
      };
    } catch (error) {
      console.error("React to review error:", error);
      throw error;
    }
  },

  // Get a user's reaction for a specific review
  async getUserReaction(
    reviewId: string,
    userId: string
  ): Promise<ReviewReaction | null> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        REVIEW_REACTIONS_COLLECTION_ID,
        [
          Query.equal("reviewId", reviewId),
          Query.equal("userId", userId),
          Query.limit(1), // We only expect one reaction per user per review
        ]
      );
      return result.documents.length > 0
        ? (result.documents[0] as unknown as ReviewReaction)
        : null;
    } catch (error) {
      console.error("Get user reaction error:", error);
      throw error;
    }
  },

  // Update an existing review (e.g., edit text)
  async updateReview(
    reviewId: string,
    data: Partial<Pick<Review, "text" | "rating" | "title">> // Allow updating text, rating, title for now
  ): Promise<Review> {
    try {
      const updatedReview = await databases.updateDocument(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        reviewId,
        {
          ...data, // Spread the fields to update (e.g., { text: "new text" })
          updatedAt: new Date().toISOString(),
        }
      );

      // Optionally, re-calculate business rating if rating was updated
      // await updateBusinessRating(updatedReview.businessId);

      return updatedReview as unknown as Review;
    } catch (error) {
      console.error("Update review error:", error);
      throw error;
    }
  },

  async deleteReview(reviewId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        reviewId
      );
      // TODO: Update business rating and review count after deleting a review
    } catch (error) {
      console.error("Delete review error:", error);
      throw error;
    }
  },

  // Get replies for a specific review
  async getReviewReplies(parentReviewId: string): Promise<Review[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        [
          Query.equal("parentReviewId", parentReviewId),
          Query.orderAsc("createdAt"), // Show replies chronologically
        ]
      );
      return result.documents as unknown as Review[];
    } catch (error) {
      console.error("Get review replies error:", error);
      throw error; // Re-throw or return empty array based on desired error handling
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
      let imageUrl = null;
      let imageName = null;
      let imageSize = null;

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
      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours later

      const newMessage = await databases.createDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        ID.unique(),
        {
          conversationId,
          senderId,
          text,
          imageUrl,
          imageName,
          imageSize,
          isRead: false,
          createdAt: createdAt.toISOString(),
          expiresAt: expiresAt.toISOString(), // Add expiresAt timestamp
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
          Query.orderAsc("createdAt"), // Most recent first
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
  // Delete expired messages
  async deleteExpiredMessages(): Promise<{ totalDeletedCount: number }> {
    let totalDeletedCount = 0;
    let hasMore = true;
    let offset = 0;
    const batchSize = 100; // Appwrite's default limit is 25, max is 100 per request for listDocuments

    try {
      const now = new Date().toISOString();

      while (hasMore) {
        const expiredMessagesBatch = await databases.listDocuments(
          DATABASE_ID,
          MESSAGES_COLLECTION_ID,
          [
            Query.lessThanEqual("expiresAt", now),
            Query.limit(batchSize),
            Query.offset(offset),
          ]
        );

        if (expiredMessagesBatch.documents.length === 0) {
          hasMore = false;
          break;
        }

        const deletePromises = expiredMessagesBatch.documents.map((message) =>
          databases
            .deleteDocument(DATABASE_ID, MESSAGES_COLLECTION_ID, message.$id)
            .catch((deleteError) => {
              // Log individual deletion errors but don't let one failure stop the batch
              console.error(
                `Error deleting message ${message.$id}:`,
                deleteError
              );
              return null; // Indicate failure for this specific promise
            })
        );

        const results = await Promise.all(deletePromises);
        const successfulDeletionsInBatch = results.filter(
          (r) => r !== null
        ).length;
        totalDeletedCount += successfulDeletionsInBatch;

        console.log(
          `Processed batch: ${successfulDeletionsInBatch} messages deleted.`
        );

        // Appwrite's listDocuments total refers to the total matching documents in the DB,
        // not just the current batch. We check if the number of documents returned is less than batchSize
        // or if the total count is met by the current offset + returned documents.
        // A simpler way for looping is just checking if documents.length < batchSize.
        if (expiredMessagesBatch.documents.length < batchSize) {
          hasMore = false;
        } else {
          offset += batchSize; // Prepare for the next batch
        }
      }

      console.log(
        `Successfully deleted a total of ${totalDeletedCount} expired messages.`
      );
      return { totalDeletedCount };
    } catch (error) {
      console.error("Error in batch deleting expired messages:", error);
      // Depending on requirements, you might want to return partial success
      // or re-throw to indicate a larger failure.
      return { totalDeletedCount }; // Return count of messages deleted so far
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
    participants: Record<string, Models.User<Models.Preferences>[]>;
  }> {
    try {
      // Get all conversations
      const userConversations = (
        await databases.listDocuments(
          DATABASE_ID,
          CONVERSATIONS_COLLECTION_ID,
          [Query.contains("participants", userId)]
        )
      ).documents as unknown as Conversation[];

      // Get last messages for each conversation
      const lastMessages: Record<string, Message> = {};
      const unreadCounts: Record<string, number> = {};
      const participants: Record<string, Models.User<Models.Preferences>[]> =
        {};

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
        const otherParticipants: Models.User<Models.Preferences>[] = [];

        for (const participantId of otherParticipantIds) {
          try {
            otherParticipants.push(await users.get(participantId));
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

export function getImageURl(imageID: string) {
  return `https://cloud.appwrite.io/v1/storage/buckets/${BUSINESS_IMAGES_BUCKET_ID}/files/${imageID}/view?project=${process.env.APPWRITE_PROJECT_ID}`;
}

// Payment Transaction Service
export const PaymentTransactionService = {
  // Create a new payment transaction
  async createPaymentTransaction(
    data: Omit<PaymentTransaction, "$id" | "createdAt" | "updatedAt">
  ): Promise<PaymentTransaction> {
    try {
      const newTransaction = await databases.createDocument(
        DATABASE_ID,
        PAYMENT_TRANSACTIONS_COLLECTION_ID,
        ID.unique(),
        {
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      return newTransaction as unknown as PaymentTransaction;
    } catch (error) {
      console.error("Create payment transaction error:", error);
      throw error;
    }
  },

  // Get a payment transaction by ID
  async getPaymentTransactionById(
    transactionId: string
  ): Promise<PaymentTransaction | null> {
    try {
      const transaction = await databases.getDocument(
        DATABASE_ID,
        PAYMENT_TRANSACTIONS_COLLECTION_ID,
        transactionId
      );
      return transaction as unknown as PaymentTransaction;
    } catch (error: any) {
      if (error.code === 404) {
        // Document not found
        return null;
      }
      console.error("Get payment transaction by ID error:", error);
      throw error;
    }
  },

  // Update a payment transaction
  async updatePaymentTransaction(
    transactionId: string,
    data: Partial<
      Omit<
        PaymentTransaction,
        "$id" | "createdAt" | "updatedAt" | "userId" | "providerTransactionId"
      >
    >
  ): Promise<PaymentTransaction> {
    try {
      const updatedTransaction = await databases.updateDocument(
        DATABASE_ID,
        PAYMENT_TRANSACTIONS_COLLECTION_ID,
        transactionId,
        {
          ...data,
          updatedAt: new Date().toISOString(),
        }
      );
      return updatedTransaction as unknown as PaymentTransaction;
    } catch (error) {
      console.error("Update payment transaction error:", error);
      throw error;
    }
  },

  // Delete a payment transaction
  async deletePaymentTransaction(transactionId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        PAYMENT_TRANSACTIONS_COLLECTION_ID,
        transactionId
      );
    } catch (error) {
      console.error("Delete payment transaction error:", error);
      throw error;
    }
  },
};

// Mailing List Service
export const MailingListService = {
  // Add email to mailing list
  async addEmail(email: string): Promise<Models.Document> {
    try {
      // Optional: Check if email already exists to prevent duplicates
      // This might be better handled by a unique index on the 'email' attribute in Appwrite
      const existingEmails = await databases.listDocuments(
        DATABASE_ID,
        MAILING_LIST_COLLECTION_ID,
        [Query.equal("email", email)]
      );

      if (existingEmails.total > 0) {
        // Email already exists, you can either return the existing document or throw an error
        // For simplicity, let's return the existing document or a specific message
        // throw new Error("Email already subscribed.");
        return existingEmails.documents[0]; // Or handle as you see fit
      }

      const newEmailEntry = await databases.createDocument(
        DATABASE_ID,
        MAILING_LIST_COLLECTION_ID,
        ID.unique(),
        {
          email,
          subscribedAt: new Date().toISOString(),
        }
      );
      return newEmailEntry;
    } catch (error) {
      console.error("Add email to mailing list error:", error);
      throw error;
    }
  },

  // Get all emails from mailing list
  async getAllEmails(): Promise<Models.Document[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        MAILING_LIST_COLLECTION_ID,
        [Query.orderDesc("subscribedAt")] // Optional: order by subscription date
      );
      return result.documents;
    } catch (error) {
      console.error("Get all mailing list emails error:", error);
      throw error;
    }
  },
};

// Anonymous Submission Service
export const AnonymousSubmissionService = {
  async uploadAnonymousSubmissionFile(file: File): Promise<string> {
    try {
      const result = await storage.createFile(
        ANONYMOUS_SUBMISSIONS_BUCKET_ID,
        ID.unique(),
        file
      );
      return result.$id;
    } catch (error) {
      console.error("Upload anonymous submission file error:", error);
      throw error;
    }
  },

  async createAnonymousSubmission(
    data: Omit<AnonymousSubmission, "$id" | "createdAt" | "updatedAt">
  ): Promise<AnonymousSubmission> {
    try {
      const newSubmission = await databases.createDocument(
        DATABASE_ID,
        ANONYMOUS_SUBMISSIONS_COLLECTION_ID,
        ID.unique(),
        {
          ...data,
          specialCode: generateSpecialCode(data.name),
          salaryAccount: JSON.stringify(data.salaryAccount),
        }
      );
      return newSubmission as unknown as AnonymousSubmission;
    } catch (error) {
      console.error("Create anonymous submission error:", error);
      throw error;
    }
  },
  async getAnonymousSubmissionById(
    submissionId: string
  ): Promise<AnonymousSubmission> {
    try {
      const submission = await databases.getDocument(
        DATABASE_ID,
        ANONYMOUS_SUBMISSIONS_COLLECTION_ID,
        submissionId
      );
      return {
        ...submission,
        fileURL: getImageURl(submission.submitIdFileId),
        salaryAccount: JSON.parse(submission.salaryAccount),
      } as unknown as AnonymousSubmission;
    } catch (error) {
      console.error(
        `Get anonymous submission error for ${submissionId}:`,
        error
      );
      throw error;
    }
  },

  async getAllAnonymousSubmissions(): Promise<AnonymousSubmission[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        ANONYMOUS_SUBMISSIONS_COLLECTION_ID,
        [
          // Add any necessary queries here, e.g., Query.limit(100)
          // For now, fetching all, but consider pagination for large datasets
        ]
      );
      return result.documents.map((submission) => ({
        ...submission,
        salaryAccount: JSON.parse(submission.salaryAccount),
      })) as unknown as AnonymousSubmission[];
    } catch (error) {
      console.error("Error fetching all anonymous submissions:", error);
      throw error;
    }
  },
};

function generateSpecialCode(name: string) {
  const start_section = name.split(" ")[0].substring(5);
  const end_section = Array.from({ length: 5 })
    .map(() => Math.round(Math.random() * 9))
    .join("");
  return `${start_section}_${end_section}`;
}

// Export client and services for direct use in components when needed
export { client, databases, storage, avatars, users, account };
