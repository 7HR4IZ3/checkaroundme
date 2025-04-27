import {
  ID,
  Query,
  Storage,
} from "node-appwrite";

import {
  BusinessImage,
} from "../../schema"; // Corrected schema import path

import { databases, storage, DATABASE_ID, BUSINESS_IMAGES_COLLECTION_ID, BUSINESS_IMAGES_BUCKET_ID } from "../index"; // Assuming databases, storage and constants remain in index.ts
import { getImageURl } from "../index"; // Assuming getImageURl remains in index.ts

// Business Images Service
export const BusinessImagesService = {
  // Temporary upload image
  async uploadTempBusinessImage(
    files: File[],
    userID: string,
    businessId?: string | null
  ): Promise<BusinessImage[]> {
    try {
      const images: BusinessImage[] = [];

      for (const file of files) {
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
            businessId: businessId || userID,
            imageUrl: getImageURl(result.$id),
            title: file.name,
            isPrimary: false,
            createdAt: new Date().toISOString(),
            uploadedBy: userID,
          }
        );

        images.push(image as unknown as BusinessImage);
      }

      return images;
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
    images: { isPrimary: boolean; imageID: string }[]
  ): Promise<void> {
    let hasPrimaryimage = false;
    for (const [index, image] of images.reverse().entries()) {
      hasPrimaryimage = !hasPrimaryimage
        ? image.isPrimary || index === images.length - 1
        : false;

      await databases.updateDocument(
        DATABASE_ID,
        BUSINESS_IMAGES_COLLECTION_ID,
        image.imageID,
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
      await storage.deleteFile(BUSINESS_IMAGES_BUCKET_ID, imageId);
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