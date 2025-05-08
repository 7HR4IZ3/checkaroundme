"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/useClientAuth";
import BusinessForm from "@/components/business/business-form"; // Import the new component

export default function BusinessCreateForm() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return router.push("/auth");
  }

  if (user.prefs.subscriptionStatus !== "active") {
    return router.push("/business/payment");
  }

  const createBusiness = trpc.createBusiness.useMutation();
  const handleCreateBusiness = async (formData: any) => {
    if (!user?.$id) {
      toast.error("Error", { description: "User not authenticated." });
      return;
    }

    try {
      const result = await createBusiness.mutateAsync({
        ...formData,
        ownerId: user.$id,
        userId: user.$id, // Assuming userId is also needed for creation
      });
      toast.success("Business Created", {
        description: "Your business has been successfully created.",
      });
      router.push(`/business/${result.$id}`);
    } catch (error: any) {
      console.error("Failed to create business", error);
      if (error.data?.httpStatus === 400) {
        const errors = JSON.parse(error.message);
        // You might want to handle specific field errors here if needed,
        // but the BusinessForm component now handles basic required field validation.
        console.error("Validation errors:", errors);
        toast.error("Validation Error", {
          description: "Please check the form for errors.",
        });
      } else {
        toast.error("Failed to Create Business", {
          description: error.message || "An unexpected error occurred.",
        });
      }
    }
  };

  return (
    <BusinessForm
      onSubmit={handleCreateBusiness}
      submitButtonText="Create Business"
      isSubmitting={createBusiness.status === "pending"}
    />
  );
}
