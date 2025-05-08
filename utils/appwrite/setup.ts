import "dotenv/config";

import { Client, Databases } from "node-appwrite";
import {
  DATABASE_ID,
  USERS_COLLECTION_ID,
  BUSINESSES_COLLECTION_ID,
  BUSINESS_HOURS_COLLECTION_ID,
  BUSINESS_IMAGES_COLLECTION_ID,
  REVIEWS_COLLECTION_ID,
  REVIEW_REACTIONS_COLLECTION_ID,
  CATEGORIES_COLLECTION_ID,
  MESSAGES_COLLECTION_ID,
  CONVERSATIONS_COLLECTION_ID,
  client,
  databases,
} from "../../src/lib/appwrite";

// Utility to create database, collections, and attributes for Appwrite
// Run this script once to set up your Appwrite database schema

async function ensureDatabase() {
  try {
    await databases.get(DATABASE_ID);
    console.log(`Database '${DATABASE_ID}' already exists.`);
  } catch {
    await databases.create(DATABASE_ID, "Main Database");
    console.log(`Database '${DATABASE_ID}' created.`);
  }
}

async function ensureCollection(collectionId: string, name: string) {
  try {
    await databases.getCollection(DATABASE_ID, collectionId);
    console.log(`Collection '${collectionId}' already exists.`);
  } catch {
    await databases.createCollection(DATABASE_ID, collectionId, name);
    console.log(`Collection '${collectionId}' created.`);
  }
}

// Helper to create attribute if not exists
async function ensureAttribute(
  collectionId: string,
  attrId: string,
  type: string,
  options: any = {},
) {
  // Check if attribute exists
  const attrs = await databases.listAttributes(DATABASE_ID, collectionId);
  if (attrs.attributes.some((a: any) => a.key === attrId)) {
    console.log(`Attribute '${attrId}' in '${collectionId}' already exists.`);
    return;
  }
  switch (type) {
    case "string":
      await databases.createStringAttribute(
        DATABASE_ID,
        collectionId,
        attrId,
        options.size || 255,
        options.required || false,
        options.default,
      );
      break;
    case "email":
      await databases.createEmailAttribute(
        DATABASE_ID,
        collectionId,
        attrId,
        options.required || false,
        options.default,
      );
      break;
    case "boolean":
      await databases.createBooleanAttribute(
        DATABASE_ID,
        collectionId,
        attrId,
        options.required || false,
        options.default,
      );
      break;
    case "integer":
      await databases.createIntegerAttribute(
        DATABASE_ID,
        collectionId,
        attrId,
        options.required || false,
        options.min,
        options.max,
        options.default,
      );
      break;
    case "float":
      await databases.createFloatAttribute(
        DATABASE_ID,
        collectionId,
        attrId,
        options.required || false,
        options.min,
        options.max,
        options.default,
      );
      break;
    case "url":
      await databases.createUrlAttribute(
        DATABASE_ID,
        collectionId,
        attrId,
        options.required || false,
        options.default,
      );
      break;
    case "enum":
      await databases.createEnumAttribute(
        DATABASE_ID,
        collectionId,
        attrId,
        options.elements,
        options.required || false,
        options.default,
      );
      break;
    case "string[]":
      await databases.createStringAttribute(
        DATABASE_ID,
        collectionId,
        attrId,
        options.size || 255,
        options.required || false,
        options.default,
        true, // array
      );
      break;
    case "datetime":
      await databases.createDatetimeAttribute(
        DATABASE_ID,
        collectionId,
        attrId,
        options.required || false,
        options.default,
      );
      break;
    default:
      throw new Error(`Unknown attribute type: ${type}`);
  }
  console.log(`Attribute '${attrId}' created in '${collectionId}'.`);
}

// Setup all collections and attributes
async function setupCollectionsAndAttributes() {
  // USERS
  await ensureCollection(USERS_COLLECTION_ID, "Users");
  await ensureAttribute(USERS_COLLECTION_ID, "fullName", "string", {
    required: true,
    size: 100,
  });
  await ensureAttribute(USERS_COLLECTION_ID, "email", "email", {
    required: true,
  });
  await ensureAttribute(USERS_COLLECTION_ID, "phone", "string", { size: 30 });
  await ensureAttribute(USERS_COLLECTION_ID, "avatarUrl", "url");
  await ensureAttribute(USERS_COLLECTION_ID, "isVerified", "boolean", {
    default: false,
  });
  await ensureAttribute(USERS_COLLECTION_ID, "createdAt", "datetime");
  await ensureAttribute(USERS_COLLECTION_ID, "updatedAt", "datetime");

  // BUSINESSES
  await ensureCollection(BUSINESSES_COLLECTION_ID, "Businesses");
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "name", "string", {
    required: true,
    size: 100,
  });
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "description", "string", {
    size: 500,
  });
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "about", "string", {
    size: 1000,
  });
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "categories", "string[]", {
    required: true,
  });
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "services", "string[]");
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "isVerified", "boolean", {
    default: false,
  });
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "rating", "float", {
    default: 0,
    min: 0,
    max: 5,
  });
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "reviewCount", "integer", {
    default: 0,
  });
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "addressLine1", "string", {
    required: true,
    size: 255,
  });
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "addressLine2", "string", {
    size: 255,
  });
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "city", "string", {
    required: true,
    size: 100,
  });
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "state", "string", {
    size: 100,
  });
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "country", "string", {
    default: "Nigeria",
    size: 100,
  });
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "postalCode", "string", {
    size: 20,
  });
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "coordinates", "string", {
    size: 100,
  }); // store as JSON string
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "phone", "string", {
    size: 30,
  });
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "email", "email");
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "website", "url");
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "createdAt", "datetime");
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "updatedAt", "datetime");
  await ensureAttribute(BUSINESSES_COLLECTION_ID, "ownerId", "string", {
    required: true,
    size: 36,
  });

  // BUSINESS_HOURS
  await ensureCollection(BUSINESS_HOURS_COLLECTION_ID, "Business Hours");
  await ensureAttribute(BUSINESS_HOURS_COLLECTION_ID, "businessId", "string", {
    required: true,
    size: 36,
  });
  await ensureAttribute(BUSINESS_HOURS_COLLECTION_ID, "day", "enum", {
    elements: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    required: true,
  });
  await ensureAttribute(BUSINESS_HOURS_COLLECTION_ID, "openTime", "string", {
    required: true,
    size: 10,
  });
  await ensureAttribute(BUSINESS_HOURS_COLLECTION_ID, "closeTime", "string", {
    required: true,
    size: 10,
  });
  await ensureAttribute(BUSINESS_HOURS_COLLECTION_ID, "isClosed", "boolean", {
    default: false,
  });

  // BUSINESS_IMAGES
  await ensureCollection(BUSINESS_IMAGES_COLLECTION_ID, "Business Images");
  await ensureAttribute(BUSINESS_IMAGES_COLLECTION_ID, "businessId", "string", {
    required: true,
    size: 36,
  });
  await ensureAttribute(BUSINESS_IMAGES_COLLECTION_ID, "imageUrl", "url", {
    required: true,
  });
  await ensureAttribute(BUSINESS_IMAGES_COLLECTION_ID, "title", "string", {
    size: 100,
  });
  await ensureAttribute(BUSINESS_IMAGES_COLLECTION_ID, "isPrimary", "boolean", {
    default: false,
  });
  await ensureAttribute(BUSINESS_IMAGES_COLLECTION_ID, "createdAt", "datetime");
  await ensureAttribute(BUSINESS_IMAGES_COLLECTION_ID, "uploadedBy", "string", {
    size: 36,
  });

  // REVIEWS
  await ensureCollection(REVIEWS_COLLECTION_ID, "Reviews");
  await ensureAttribute(REVIEWS_COLLECTION_ID, "businessId", "string", {
    required: true,
    size: 36,
  });
  await ensureAttribute(REVIEWS_COLLECTION_ID, "userId", "string", {
    required: true,
    size: 36,
  });
  await ensureAttribute(REVIEWS_COLLECTION_ID, "rating", "integer", {
    required: true,
    min: 1,
    max: 5,
  });
  await ensureAttribute(REVIEWS_COLLECTION_ID, "title", "string", {
    size: 100,
  });
  await ensureAttribute(REVIEWS_COLLECTION_ID, "text", "string", {
    required: true,
    size: 2000,
  });
  await ensureAttribute(REVIEWS_COLLECTION_ID, "recommendation", "string", {
    size: 255,
  });
  await ensureAttribute(REVIEWS_COLLECTION_ID, "createdAt", "datetime");
  await ensureAttribute(REVIEWS_COLLECTION_ID, "updatedAt", "datetime");
  await ensureAttribute(REVIEWS_COLLECTION_ID, "likes", "integer", {
    default: 0,
  });
  await ensureAttribute(REVIEWS_COLLECTION_ID, "dislikes", "integer", {
    default: 0,
  });

  // REVIEW_REACTIONS
  await ensureCollection(REVIEW_REACTIONS_COLLECTION_ID, "Review Reactions");
  await ensureAttribute(REVIEW_REACTIONS_COLLECTION_ID, "reviewId", "string", {
    required: true,
    size: 36,
  });
  await ensureAttribute(REVIEW_REACTIONS_COLLECTION_ID, "userId", "string", {
    required: true,
    size: 36,
  });
  await ensureAttribute(REVIEW_REACTIONS_COLLECTION_ID, "type", "enum", {
    elements: ["like", "dislike"],
    required: true,
  });
  await ensureAttribute(
    REVIEW_REACTIONS_COLLECTION_ID,
    "createdAt",
    "datetime",
  );

  // CATEGORIES
  await ensureCollection(CATEGORIES_COLLECTION_ID, "Categories");
  await ensureAttribute(CATEGORIES_COLLECTION_ID, "name", "string", {
    required: true,
    size: 100,
  });
  await ensureAttribute(CATEGORIES_COLLECTION_ID, "description", "string", {
    size: 255,
  });
  await ensureAttribute(CATEGORIES_COLLECTION_ID, "imageUrl", "url");
  await ensureAttribute(CATEGORIES_COLLECTION_ID, "parentId", "string", {
    size: 36,
  });

  // MESSAGES
  await ensureCollection(MESSAGES_COLLECTION_ID, "Messages");
  await ensureAttribute(MESSAGES_COLLECTION_ID, "conversationId", "string", {
    required: true,
    size: 36,
  });
  await ensureAttribute(MESSAGES_COLLECTION_ID, "senderId", "string", {
    required: true,
    size: 36,
  });
  await ensureAttribute(MESSAGES_COLLECTION_ID, "text", "string", {
    size: 2000,
  });
  await ensureAttribute(MESSAGES_COLLECTION_ID, "imageUrl", "url");
  await ensureAttribute(MESSAGES_COLLECTION_ID, "imageName", "string", {
    size: 100,
  });
  await ensureAttribute(MESSAGES_COLLECTION_ID, "imageSize", "string", {
    size: 20,
  });
  await ensureAttribute(MESSAGES_COLLECTION_ID, "isRead", "boolean", {
    default: false,
  });
  await ensureAttribute(MESSAGES_COLLECTION_ID, "createdAt", "datetime");

  // CONVERSATIONS
  await ensureCollection(CONVERSATIONS_COLLECTION_ID, "Conversations");
  await ensureAttribute(
    CONVERSATIONS_COLLECTION_ID,
    "participants",
    "string[]",
    { required: true },
  );
  await ensureAttribute(
    CONVERSATIONS_COLLECTION_ID,
    "lastMessageId",
    "string",
    { size: 36 },
  );
  await ensureAttribute(CONVERSATIONS_COLLECTION_ID, "createdAt", "datetime");
  await ensureAttribute(CONVERSATIONS_COLLECTION_ID, "updatedAt", "datetime");
}

async function main() {
  await ensureDatabase();
  await setupCollectionsAndAttributes();
  console.log("Database and collections setup complete.");
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
