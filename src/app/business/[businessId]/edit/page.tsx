"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useAuth } from "@/lib/hooks/useClientAuth";
import BusinessForm from "@/components/business/business-form"; // Import the new component
import { toast } from "sonner";
import { VerificationUpload } from "@/components/business/verification-upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function BusinessEditForm() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const businessId =
    typeof params.businessId === "string"
      ? params.businessId
      : Array.isArray(params.businessId)
        ? params.businessId[0]
        : "";

  if (!isAuthenticated) {
    router.push("/auth");
    return null;
  }

  const {
    data: business,
    isLoading: isBusinessLoading,
    error: businessError,
  } = trpc.getBusinessById.useQuery({ businessId }, { enabled: !!businessId });

  const { data: images, isLoading: isImagesLoading } =
    trpc.getBusinessImages.useQuery({ businessId }, { enabled: !!businessId });

  const { data: hours, isLoading: isHoursLoading } =
    trpc.getBusinessHours.useQuery({ businessId }, { enabled: !!businessId });

  const updateBusiness = trpc.updateBusiness.useMutation();

  const handleUpdateBusiness = async (formData: any) => {
    if (!businessId) {
      toast("Error", { description: "Business ID is missing." });
      return;
    }
    try {
      await updateBusiness.mutateAsync({
        businessId,
        data: formData,
      });
      toast("Business Updated", {
        description: "Your business has been successfully updated.",
      });
      router.push(`/business/${businessId}`);
    } catch (error: any) {
      console.error("Failed to update business", error);
      if (error.data?.httpStatus === 400) {
        const errors = JSON.parse(error.message);
        console.error("Validation errors:", errors);
        toast("Validation Error", {
          description: "Please check the form for errors.",
        });
      } else {
        toast("Failed to Update Business", {
          description: error.message || "An unexpected error occurred.",
        });
      }
    }
  };

  // Combine data from multiple queries into initialData for the form
  const initialData = business
    ? {
        ...business,
        images: images,
        hours: hours,
      }
    : undefined;

  if (isBusinessLoading || isImagesLoading || isHoursLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (businessError) {
    return <div>Error loading business data.</div>; // Or an error message
  }

  return (
    <div className="space-y-6">
      <BusinessForm
        businessId={businessId}
        initialData={initialData}
        onSubmit={handleUpdateBusiness}
        submitButtonText="Update Business"
        isSubmitting={updateBusiness.isPending}
      />

      {/* <Card>
        <CardHeader>
          <CardTitle>Business Verification</CardTitle>
          <CardDescription>
            Upload documents to verify your business.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerificationUpload businessId={businessId} />
        </CardContent>
      </Card> */}
    </div>
  );
}
