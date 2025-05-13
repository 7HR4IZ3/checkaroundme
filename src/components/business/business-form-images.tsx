import React, { useCallback } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { LoadingSVG } from "@/components/ui/loading";
import { BusinessImage } from "@/lib/schema"; // Assuming BusinessImage type is here
import { toast } from "sonner"; // For error notifications

// Define the expected structure for the user object, if only $id is needed
interface User {
  $id: string;
}

interface BusinessFormImagesProps {
  businessImages: BusinessImage[];
  setBusinessImages: React.Dispatch<React.SetStateAction<BusinessImage[]>>;
  isImageUploading: boolean;
  setIsImageUploading: React.Dispatch<React.SetStateAction<boolean>>;
  isImageDeleting: string[]; // Array of image IDs being deleted
  setIsImageDeleting: React.Dispatch<React.SetStateAction<string[]>>;
  isLoadingTempImages: boolean; // From parent's tRPC query for initial images in create mode

  // For API calls
  user: User | null; // User object, can be null if not authenticated
  businessId?: string; // Optional businessId for edit mode

  // tRPC mutation for deleting an image (passed from parent)
  deleteBusinessImageMutation: {
    mutateAsync: (params: {
      imageId: string;
      businessId: string;
    }) => Promise<any>; // Adjust 'any' to the actual return type if known
  };
}

export const BusinessFormImages: React.FC<BusinessFormImagesProps> = React.memo(
  ({
    businessImages,
    setBusinessImages,
    isImageUploading,
    setIsImageUploading,
    isImageDeleting,
    setIsImageDeleting,
    isLoadingTempImages,
    user,
    businessId,
    deleteBusinessImageMutation,
  }) => {
    const handleImageUpload = useCallback(
      async (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsImageUploading(true);
        const files = event.target.files;

        if (files && files.length > 0) {
          try {
            const form = new FormData();
            for (let index = 0; index < files.length; index++) {
              const file = files.item(index);
              if (!file) continue;
              form.append("images", file, file.name);
            }

            if (user?.$id) {
              form.append("userID", user.$id);
            }
            if (businessId) {
              form.append("businessID", businessId);
            }

            const response = await fetch("/api/upload/images", {
              method: "POST",
              body: form,
            });

            if (response.ok) {
              const result: BusinessImage[] = await response.json();
              setBusinessImages((prev) => [...prev, ...result]);
              toast.success("Images uploaded successfully!");
            } else {
              const errorData = await response
                .json()
                .catch(() => ({ message: "Failed to upload images." }));
              toast.error("Upload Failed", {
                description: errorData.message || "Could not upload images.",
              });
            }
          } catch (err) {
            console.error("Failed to upload image", err);
            toast.error("Upload Error", {
              description: "An unexpected error occurred during upload.",
            });
          }
        }
        setIsImageUploading(false);
      },
      [setIsImageUploading, user, businessId, setBusinessImages]
    );

    const handleImageDelete = useCallback(
      async (idToDelete: string) => {
        if (!user?.$id && !businessId) {
          toast.error("Error", {
            description:
              "Cannot delete image without user or business context.",
          });
          return;
        }
        try {
          setIsImageDeleting((prev) => [...prev, idToDelete]);
          await deleteBusinessImageMutation.mutateAsync({
            imageId: idToDelete,
            businessId: businessId || user!.$id, // user.$id is guaranteed if businessId is not present by auth checks
          });
          setBusinessImages((prev) =>
            prev.filter((img) => img.$id !== idToDelete)
          );
          toast.success("Image deleted successfully!");
        } catch (err) {
          console.error("Failed to delete image", err);
          toast.error("Delete Failed", {
            description: "Failed to delete image.",
          });
        } finally {
          setIsImageDeleting((prev) => prev.filter((id) => id !== idToDelete));
        }
      },
      [
        user,
        businessId,
        deleteBusinessImageMutation,
        setIsImageDeleting,
        setBusinessImages,
      ]
    );

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">
          Business Photos/Videos
        </h3>
        <div>
          <Label className="font-semibold block mb-2">
            Upload Images/Videos
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Add or remove photos and videos for your business.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            {businessImages.map((image, index) => (
              <Card
                key={image.$id || `image-${index}`} // Fallback key if $id is somehow missing
                className="relative group aspect-square overflow-hidden"
              >
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 z-10 h-7 w-7 p-1 opacity-80 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleImageDelete(image.$id)}
                  aria-label="Delete image"
                  disabled={isImageDeleting.includes(image.$id)}
                >
                  {isImageDeleting.includes(image.$id) ? (
                    <LoadingSVG />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
                <Image
                  src={image.imageUrl}
                  alt={image.title || "Business Image"}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  style={{ objectFit: "cover" }}
                  priority={index < 3} // Prioritize loading for the first few images
                  className={
                    isImageDeleting.includes(image.$id) ? "opacity-50" : ""
                  }
                />
              </Card>
            ))}

            {(isLoadingTempImages || isImageUploading) && (
              <div className="flex items-center justify-center w-full aspect-square border rounded-md">
                <LoadingSVG />
              </div>
            )}

            {/* Add Photo Button */}
            <Label
              htmlFor="imageUploadInput" // Changed htmlFor to avoid conflict with main form's imageUpload
              className="flex flex-col items-center justify-center aspect-square cursor-pointer border-2 border-dashed border-muted-foreground/50 hover:border-primary rounded-md transition-colors"
            >
              <Plus className="h-12 w-12 text-muted-foreground group-hover:text-primary" />
              <span className="text-sm text-muted-foreground mt-1 group-hover:text-primary">
                Add photo/video
              </span>
              <Input
                id="imageUploadInput"
                type="file"
                multiple
                className="sr-only"
                accept="image/*, video/*" // Consider more specific types if needed
                onChange={handleImageUpload}
                disabled={isImageUploading}
              />
            </Label>
          </div>
        </div>
      </div>
    );
  }
);

BusinessFormImages.displayName = "BusinessFormImages";
