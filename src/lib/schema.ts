import { z } from "zod";

export const daySchema = z.object({
  open: z.string(),
  close: z.string(),
  closed: z.boolean(),
});

// User schema
export const userSchema = z.object({
  $id: z.string(),
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
  $id: z.string(),
  name: z.string().min(3, "Business name must be at least 3 characters"),
  about: z.string(),
  categories: z.array(z.string()),
  services: z.array(z.string()).optional(),
  verificationStatus: z
    .enum(["pending", "verified", "rejected", "not_submitted"])
    .default("not_submitted"),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().default(0),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  state: z.string().optional(),
  country: z.string().default("Nigeria"),
  postalCode: z.string().optional(),
  paymentOptions: z.array(z.string()).optional(), // e.g., ["cash", "bank_transfers"] - Can be used for filtering
  coordinates: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  ownerId: z.string(),
  status: z.enum(["active", "disabled"]).default("disabled"),

  // Fields for filtering based on FiltersPanel
  priceIndicator: z.string().optional(), // Stores "$10", "$100", etc.
  // open_now: z.boolean().optional().default(false), // Requires logic to determine based on BusinessHours
  onSiteParking: z.boolean().optional().default(false),
  garageParking: z.boolean().optional().default(false),
  wifi: z.boolean().optional().default(false),
  // Note: bank_transfers and cash can be inferred from paymentOptions array
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
  $id: z.string(),
  businessId: z.string(),
  day: z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
  openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/), // Format: "9:00 AM"
  closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/), // Format: "6:00 PM"
  isClosed: z.boolean().default(false),
});

// Business Image schema
export const businessImageSchema = z.object({
  $id: z.string(),
  businessId: z.string(),
  imageUrl: z.string().url(),
  title: z.string().optional(),
  isPrimary: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  uploadedBy: z.string().optional(), // User ID who uploaded
});

// Review schema
export const reviewSchema = z.object({
  $id: z.string(),
  businessId: z.string(),
  userId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  text: z.string().min(5, "Review must be at least 5 characters"),
  recommendation: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  likes: z.number().default(0),
  dislikes: z.number().default(0),
  parentReviewId: z.string().optional(), // ID of the review this is replying to
});

// Review Reaction schema (for likes/dislikes)
export const reviewReactionSchema = z.object({
  $id: z.string(),
  reviewId: z.string(),
  userId: z.string(),
  type: z.enum(["like", "dislike"]),
  createdAt: z.date().default(() => new Date()),
});

// Category schema
export const categorySchema = z.object({
  $id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  parentId: z.string().optional(), // For subcategories
});

// Message schema
export const messageSchema = z.object({
  $id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  text: z.string().optional(),
  imageUrl: z.string().url().optional(),
  imageName: z.string().optional(),
  imageSize: z.string().optional(), // "1.9 mb"
  isRead: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
});

// Conversation schema
export const conversationSchema = z.object({
  $id: z.string(),
  participants: z.array(z.string()), // Array of user IDs
  lastMessageId: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Auth Session schema
export const authSessionSchema = z.object({
  $id: z.string(),
  userId: z.string(),
  token: z.string(),
  expiresAt: z.date(),
  createdAt: z.date().default(() => new Date()),
});

// Verification Document schema
export const verificationDocumentSchema = z.object({
  $id: z.string(),
  businessId: z.string(),
  userId: z.string(),
  documentFileId: z.string(),
  documentType: z.string().optional(), // e.g., "Passport", "Driver's License"
  submittedAt: z.date().default(() => new Date()),
  adminNotes: z.string().optional(), // Admin review comments
});

// User Settings Schema
export const userSettingsSchema = z.object({
  notifications: z
    .object({
      newMessagesEmail: z.boolean().default(true),
      businessUpdatesEmail: z.boolean().default(true),
      // Add other notification flags as needed
    })
    .default({ newMessagesEmail: true, businessUpdatesEmail: true }),
  theme: z.enum(["light", "dark", "system"]).default("system"),
});

// Change Password Schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password cannot be empty"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

// User Subscription Schema (for Appwrite User Prefs)
export const userSubscriptionSchema = z.object({
  status: z
    .enum(["active", "inactive", "cancelled", "past_due", "none"])
    .default("none"),
  planId: z.string().optional(), // Your internal plan identifier
  providerSubscriptionId: z.string().optional(), // Paystack/Flutterwave subscription ID
  currentPeriodEnd: z.string().optional(), // ISO Date string
  paystackCustomerId: z.string().optional(),
  // any other relevant fields from updateUserSubscriptionStatus
});

// Payment Transaction Schema (for a new Appwrite Collection)
export const paymentTransactionSchema = z.object({
  $id: z.string().optional(), // Appwrite generated
  userId: z.string(),
  providerTransactionId: z.string(),
  date: z.string(), // ISO Date string
  amount: z.number(),
  currency: z.string(),
  description: z.string(),
  status: z.enum(["succeeded", "failed", "pending", "refunded"]),
  provider: z.enum(["paystack", "flutterwave"]),
  invoiceUrl: z.string().url().optional(),
  createdAt: z.string().optional(), // Appwrite generated
  updatedAt: z.string().optional(), // Appwrite generated
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
export type DaySchema = z.infer<typeof daySchema>;
export type VerificationDocument = z.infer<typeof verificationDocumentSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UserSubscription = z.infer<typeof userSubscriptionSchema>;
export type PaymentTransaction = z.infer<typeof paymentTransactionSchema>;
