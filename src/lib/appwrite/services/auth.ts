import { Account, ID, Models, OAuthProvider } from "node-appwrite";
import { cookies } from "next/headers";
import { User, AuthSession } from "../../schema";

import { createAdminClient } from "../admin";
import { createSessionClient } from "../session";
import {
  client,
  databases,
  DATABASE_ID,
  USERS_COLLECTION_ID,
  account,
} from "../index"; // Assuming client, databases and constants remain in index.ts

// Auth Service
export const AuthService = {
  // Register a new user
  async register(
    email: string,
    password: string,
    name: string,
    phone?: string,
  ): Promise<User> {
    try {
      // Create user account
      const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        name,
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
        },
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
        `${redirectUrl}?failure=true`,
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
          },
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
        cookies.get("cham_appwrite_session"),
      );

      if (!session?.value) {
        return null;
      }

      const { account } = await createSessionClient(session.value);
      const user = await account.get();

      const profile = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        user.$id,
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
        cookies.get("cham_appwrite_session"),
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

  // Request password reset
  async requestPasswordReset(email: string, resetUrl: string): Promise<void> {
    try {
      // Appwrite's createRecovery sends an email with a link to the resetUrl
      // The link will contain a secret and userId as query parameters
      const session = await cookies().then((cookies) =>
        cookies.get("cham_appwrite_session"),
      );

      if (!session?.value) {
        throw new Error("Unauthenticated user");
      }

      const { account } = await createSessionClient(session.value);
      await account.createRecovery(email, resetUrl);
      // Appwrite's createRecovery resolves with an empty object on success
      // We don't need to return anything specific here, just indicate success by not throwing
    } catch (error) {
      console.error("Appwrite password reset request error:", error);
      // Re-throw the error so the tRPC procedure can handle it
      throw error;
    }
  },

  // Reset password using recovery secret
  async resetPassword(
    userId: string,
    secret: string,
    password: string,
  ): Promise<void> {
    try {
      // Appwrite's updateRecovery completes the password reset
      const session = await cookies().then((cookies) =>
        cookies.get("cham_appwrite_session"),
      );

      if (!session?.value) {
        throw new Error("Unauthenticated user");
      }

      const { account } = await createSessionClient(session.value);
      await account.updateRecovery(userId, secret, password);
      // Appwrite's updateRecovery resolves with an empty object on success
      // We don't need to return anything specific here, just indicate success by not throwing
    } catch (error) {
      console.error("Appwrite password reset error:", error);
      // Re-throw the error so the tRPC procedure can handle it
      throw error;
    }
  },

  // Change current user's password
  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      // The `account` instance here should be for the currently authenticated user.
      // Appwrite's `account.updatePassword` uses the active session.
      const session = await cookies().then((cookies) =>
        cookies.get("cham_appwrite_session"),
      );

      if (!session?.value) {
        throw new Error("Unauthenticated user");
      }

      const { account } = await createSessionClient(session.value);
      await account.updatePassword(newPassword, currentPassword);
      // Resolves with an empty object on success or throws.
    } catch (error) {
      console.error("Appwrite change password error:", error);
      throw error; // Re-throw to be handled by the tRPC procedure
    }
  },
};
