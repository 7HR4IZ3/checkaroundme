"use client"; // Required for hooks like useState, useMutation

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface VerificationUploadProps {
  businessId: string;
}

export function VerificationUpload({ businessId }: VerificationUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false); // Renamed state for clarity

  const mutation = trpc.submitVerification.useMutation({
    onSuccess: () => {
      toast.success("Verification document submitted successfully!");
      setSelectedFile(null);
    },
    onError: (error) => {
      // Provide more specific error messages if possible
      toast.error(`Submission failed: ${error.message || "Please try again."}`);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Basic validation (can be expanded)
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload PDF, JPG, or PNG.");
        setSelectedFile(null);
        event.target.value = ""; // Reset input
        return;
      }
      // Add size validation if needed
      // const maxSize = 5 * 1024 * 1024; // 5MB example
      // if (file.size > maxSize) {
      //     toast.error('File is too large. Maximum size is 5MB.');
      //     setSelectedFile(null);
      //     event.target.value = ''; // Reset input
      //     return;
      // }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    // Make async for fetch
    if (!selectedFile) {
      toast.warning("Please select a file first.");
      return;
    }
    if (!businessId) {
      // This should ideally not happen if the component is used correctly,
      // but good to have a safeguard.
      toast.error("Cannot upload: Business ID is missing.");
      console.error("VerificationUpload: businessId prop is missing.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("businessId", businessId);
    // Key must match the backend route expectation
    formData.append("verificationDocument", selectedFile);

    try {
      const response = await fetch("/api/upload/verification", {
        method: "POST",
        body: formData,
        // Headers are generally not needed for FormData with fetch,
        // the browser sets the correct Content-Type (multipart/form-data)
      });

      if (!response.ok) {
        let errorMsg = `Upload failed: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = `Upload failed: ${
            errorData.error?.message || errorData.error || response.statusText
          }`;
        } catch (e) {
          // Ignore if response is not JSON
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();
      const fileId = result?.fileId;

      if (!fileId) {
        throw new Error("Upload succeeded but did not return a file ID.");
      }

      // Now call the tRPC mutation with the fileId
      mutation.mutate({
        businessId: businessId,
        documentFileId: fileId, // Use the fileId from the API response
      });
    } catch (error: any) {
      console.error("Upload process error:", error);
      toast.error(error.message || "An error occurred during upload.");
    } finally {
      // This loading state now primarily covers the API upload part.
      // The tRPC mutation hook handles its own loading state implicitly.
      setIsUploading(false);
    }
  };

  // Combine loading states
  // isLoading now reflects both API upload and tRPC mutation states
  const isLoading = isUploading || mutation.isPending;

  return (
    <div className="space-y-4 p-4 border rounded-md shadow-sm">
      <Label htmlFor="verification-file" className="text-lg font-semibold">
        Upload Verification Document
      </Label>
      <p className="text-sm text-muted-foreground">
        Upload a document (PDF, JPG, PNG) to verify your business.
      </p>
      <Input
        id="verification-file"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png" // Match allowedTypes
        onChange={handleFileChange}
        disabled={isLoading}
        // Basic styling for the file input button itself
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white dark:text-black-foreground hover:file:bg-primary/90 cursor-pointer"
      />
      {selectedFile && !isLoading && (
        <p className="text-sm text-muted-foreground">
          Selected: {selectedFile.name}
        </p>
      )}
      <Button
        onClick={handleUpload}
        disabled={!selectedFile || isLoading}
        className="w-full sm:w-auto" // Responsive width
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isUploading
              ? "Uploading..."
              : mutation.isPending
              ? "Submitting..."
              : "Processing..."}
          </>
        ) : (
          "Upload Document"
        )}
      </Button>
    </div>
  );
}
