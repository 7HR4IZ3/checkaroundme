import { z } from "zod";

// User schema
export const userSchema = z.object({
  $id: z.string().uuid(),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// User create schema (omit id, createdAt, updatedAt)
export const createUserSchema = userSchema.omit({
  $id: true,
  createdAt: true,
  updatedAt: true,
});

// User update schema (partial, omit id, createdAt, updatedAt, email, password)
export const updateUserSchema = userSchema
  .omit({
    $id: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

// Business schema
export const businessSchema = z.object({
  $id: z.string().uuid(),
  name: z.string().min(3, "Business name must be at least 3 characters"),
  description: z.string().optional(),
  about: z.string().optional(),
  categories: z.array(z.string()),
  services: z.array(z.string()).optional(),
  isVerified: z.boolean().default(false),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().default(0),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  state: z.string().optional(),
  country: z.string().default("Nigeria"),
  postalCode: z.string().optional(),
  paymentOptions: z.array(z.string()).optional(),
  coordinates: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  ownerId: z.string().uuid(),
});

// Business create schema (omit id, rating, reviewCount, createdAt, updatedAt)
export const createBusinessSchema = businessSchema.omit({
  $id: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
  updatedAt: true,
});

// Business update schema (partial, omit id, rating, reviewCount, createdAt, updatedAt, ownerId)
export const updateBusinessSchema = businessSchema
  .omit({
    $id: true,
    rating: true,
    reviewCount: true,
    createdAt: true,
    updatedAt: true,
    ownerId: true,
  })
  .partial();

// Business Hours schema
export const businessHoursSchema = z.object({
  $id: z.string().uuid(),
  businessId: z.string().uuid(),
  day: z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
  openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/), // Format: "9:00 AM"
  closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/), // Format: "6:00 PM"
  isClosed: z.boolean().default(false),
});

// Business Image schema
export const businessImageSchema = z.object({
  $id: z.string().uuid(),
  businessId: z.string().uuid(),
  imageUrl: z.string().url(),
  title: z.string().optional(),
  isPrimary: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  uploadedBy: z.string().uuid().optional(), // User ID who uploaded
});

// Review schema
export const reviewSchema = z.object({
  $id: z.string().uuid(),
  businessId: z.string().uuid(),
  userId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  text: z.string().min(85, "Review must be at least 85 characters"),
  recommendation: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  likes: z.number().default(0),
  dislikes: z.number().default(0),
});

// Review Reaction schema (for likes/dislikes)
export const reviewReactionSchema = z.object({
  $id: z.string().uuid(),
  reviewId: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(["like", "dislike"]),
  createdAt: z.date().default(() => new Date()),
});

// Category schema
export const categorySchema = z.object({
  $id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  parentId: z.string().uuid().optional(), // For subcategories
});

// Message schema
export const messageSchema = z.object({
  $id: z.string().uuid(),
  conversationId: z.string().uuid(),
  senderId: z.string().uuid(),
  text: z.string().optional(),
  imageUrl: z.string().url().optional(),
  imageName: z.string().optional(),
  imageSize: z.string().optional(), // "1.9 mb"
  isRead: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
});

// Conversation schema
export const conversationSchema = z.object({
  $id: z.string().uuid(),
  participants: z.array(z.string().uuid()), // Array of user IDs
  lastMessageId: z.string().uuid().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Auth Session schema
export const authSessionSchema = z.object({
  $id: z.string().uuid(),
  userId: z.string().uuid(),
  token: z.string(),
  expiresAt: z.date(),
  createdAt: z.date().default(() => new Date()),
});

// Type definitions to use throughout the application
export type User = z.infer<typeof userSchema>;
export type Business = z.infer<typeof businessSchema>;
export type BusinessHours = z.infer<typeof businessHoursSchema>;
export type BusinessImage = z.infer<typeof businessImageSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type ReviewReaction = z.infer<typeof reviewReactionSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Message = z.infer<typeof messageSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type AuthSession = z.infer<typeof authSessionSchema>;
