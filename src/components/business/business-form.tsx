"use client";

import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X, Plus, Trash2, MoreVertical, ShieldCheck } from "lucide-react"; // Added ShieldCheck
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Added Dialog components
import { useAuth } from "@/lib/hooks/useClientAuth";
import { Business, BusinessImage, businessImageSchema } from "@/lib/schema";
import { LoadingSVG } from "@/components/ui/loading";
import { VerificationUpload } from "@/components/business/verification-upload";
import { BusinessFormAddress } from "./business-form-address";
import { BusinessFormServices } from "./business-form-services";
import { BusinessFormPayment } from "./business-form-payment";
import { BusinessFormHours } from "./business-form-hours"; // Import the new component

interface BusinessFormProps {
  initialData?: Business & {
    images?: {
      $id: string;
      createdAt: Date;
      businessId: string;
      imageUrl: string;
      isPrimary: boolean;
      title?: string | undefined;
      uploadedBy?: string | undefined;
    }[];
    hours?: {
      $id: string;
      businessId: string;
      day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
      openTime: string;
      closeTime: string;
      isClosed: boolean;
    }[];
  }; // Define a proper type later
  businessId?: string; // Optional businessId for edit mode
  onSubmit: (data: any) => Promise<void>; // Define a proper type later
  submitButtonText: string;
  isSubmitting: boolean;
}

const businessFormSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  about: z.string().min(1, "About section is required"),
  status: z.enum(["active", "disabled"]).optional(),
  addressLine1: z.string().min(1, "Address Line 1 is required"),
  addressLine2: z.string().optional(),
  state: z.string().optional(),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  phoneCountryCode: z.string().optional(), // Added phone country code field
  phoneNumber: z.string().optional(), // Added phone number field
  category: z.string().optional(), // Assuming categories can be an array of strings
  services: z.array(z.string()).optional(),
  paymentOptions: z.array(z.string()).optional(),
  hours: z
    .record(
      z.object({
        // Assuming hours is a record of day to hour details
        open: z.string(),
        close: z.string(),
        closed: z.boolean(),
      })
    )
    .optional(),
  images: z
    .array(
      z.object({
        $id: z.string(),
        businessId: z.string().optional(),
        imageUrl: z.string().url().optional(),
        title: z.string().optional(),
        isPrimary: z.boolean().optional(),
        createdAt: z.date().optional(),
        uploadedBy: z.string().optional(),
      })
    )
    .optional(),
  email: z.string().email("Invalid email address"),
  website: z.string().url("Invalid URL").optional(),
  maxPrice: z.number().optional(),
  on_site_parking: z.boolean().optional(),
  garage_parking: z.boolean().optional(),
  wifi: z.boolean().optional(),
  agreedToTerms: z.boolean().optional(), // Added for terms agreement
});

export type BusinessFormValues = z.infer<typeof businessFormSchema>;

export default function BusinessForm({
  initialData,
  businessId,
  onSubmit,
  submitButtonText,
  isSubmitting,
}: BusinessFormProps) {
  const { user, isAuthenticated } = useAuth();
  if (!businessId && !isAuthenticated) return redirect("/auth");

  trpc.getCountries.usePrefetchQuery();

  const utils = trpc.useUtils();
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isImageDeleting, setIsImageDeleting] = useState<string[]>([]);

  // Initialize useForm
  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      name: "",
      about: "",
      status: "disabled",
      addressLine1: "",
      addressLine2: "",
      city: "",
      country: "",
      phoneCountryCode: "+000", // Default value for phone country code
      phoneNumber: "",
      category: "",
      services: [],
      paymentOptions: [],
      hours: {
        Mon: { open: "09:00", close: "18:00", closed: false },
        Tue: { open: "09:00", close: "18:00", closed: false },
        Wed: { open: "09:00", close: "18:00", closed: false },
        Thu: { open: "09:00", close: "18:00", closed: false },
        Fri: { open: "09:00", close: "18:00", closed: false },
        Sat: { open: "09:00", close: "18:00", closed: false },
        Sun: { open: "09:00", close: "18:00", closed: true },
      },
      images: [],
      email: "",
      website: "",
      maxPrice: undefined,
      on_site_parking: false,
      garage_parking: false,
      wifi: false,
      agreedToTerms: !!businessId,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
    setError,
  } = form;

  const status = watch("status");
  const businessCategory = watch("category") ?? "";
  const businessImages = watch("images") ?? [];
  const agreedToTerms = watch("agreedToTerms") ?? false;
  const maxPrice = watch("maxPrice");
  const onSiteParking = watch("on_site_parking") ?? false;
  const garageParking = watch("garage_parking") ?? false;
  const wifi = watch("wifi") ?? false;

  const { data: businessCategories } = trpc.getAllCategories.useQuery();
  const { data: tempBusinessImages, isLoading: isLoadingTempImages } =
    trpc.getBusinessImages.useQuery(
      { businessId: user?.$id! },
      { enabled: !businessId && !!user?.$id }
    );

  const deleteBusinessImage = trpc.deleteBusinessImage.useMutation();
  const updateBusinessMutation = trpc.updateBusiness.useMutation({
    onSuccess: (updatedBusiness) => {
      const name = watch("name");
      const status = watch("status");

      if (user) {
        utils.getBusinessesByUserId.invalidate({ userId: user.$id });
      }
      updatedBusiness &&
        toast.success(
          `Business "${name}" ${
            status === "active" ? "activated" : "deactivated"
          } successfully.`
        );
    },
    onError: (error, variables) => {
      // const businessName =
      //   businesses?.find((b) => b.$id === variables.businessId)?.name ||
      //   "this business";
      toast.error(`Failed to update status.`, {
        description: error.message,
      });
    },
  });

  // --- Populate form state when initialData loads (for edit mode) ---
  // Update useEffect to use reset for initial data
  useEffect(() => {
    if (initialData) {
      console.log(initialData);
      reset({
        name: initialData.name ?? "",
        about: initialData.about ?? "",
        status: initialData.status ?? "disabled",
        addressLine1: initialData.addressLine1 ?? "",
        addressLine2: initialData.addressLine2 ?? "",
        // Split the initial phone string into code and number if possible, or handle separately
        // For now, setting both to the full phone string might be necessary depending on how initialData.phone is formatted
        // A better approach might be to fetch/store phoneCountryCode and phoneNumber separately in the backend
        // Assuming initialData.phone is just the number for now, and country code is handled by initialData.country
        phoneCountryCode: initialData.phoneCountryCode ?? "", // Need logic to derive this from initialData.country or initialData.phone
        phoneNumber: initialData.phoneNumber ?? "",
        category: initialData.category ?? [],
        services: initialData.services ?? [],
        paymentOptions: initialData.paymentOptions ?? [],
        email: initialData.email ?? "",
        website: initialData.website ?? "",
        city: initialData.city ?? "",
        country: initialData.country ?? "", // This will be the name, need to map to ISO code
        state: initialData.state ?? "", // This will be the name, need to map to ISO code
        maxPrice: initialData.maxPrice ?? undefined,
        on_site_parking: initialData.onSiteParking ?? false,
        garage_parking: initialData.garageParking ?? false,
        wifi: initialData.wifi ?? false,
        // Images and hours need special handling as their structure differs slightly
        images:
          initialData.images?.map(({ createdAt, ...image }) => ({
            ...image,
            createdAt: new Date(createdAt),
          })) ?? [],
        hours: initialData.hours?.reduce((acc, hour) => {
          acc[hour.day] = {
            open: hour.openTime ?? "",
            close: hour.closeTime ?? "",
            closed: hour.isClosed ?? false,
          };
          return acc;
        }, {} as any) ?? {
          // Provide a default structure if initialData.hours is null/undefined
          Mon: { open: "09:00", close: "18:00", closed: false },
          Tue: { open: "09:00", close: "18:00", closed: false },
          Wed: { open: "09:00", close: "18:00", closed: false },
          Thu: { open: "09:00", close: "18:00", closed: false },
          Fri: { open: "09:00", close: "18:00", closed: false },
          Sat: { open: "09:00", close: "18:00", closed: false },
          Sun: { open: "09:00", close: "18:00", closed: true },
        },
      });
    }
  }, [initialData, reset]);

  // Effect to set initial country/state ISO codes when editing and data is loaded
  useEffect(() => {
    if (initialData && initialData.country) {
      setValue("country", initialData.country);
      setValue("state", initialData.state);
    }
    // Depend on initialData, countriesData, and statesData to ensure codes are set correctly
  }, [initialData, setValue]);

  // Populate temp images in create mode
  useEffect(() => {
    if (!businessId && !isLoadingTempImages && tempBusinessImages) {
      setValue(
        "images",
        tempBusinessImages.map(({ createdAt, ...image }) => {
          return {
            ...image,
            createdAt: new Date(createdAt),
          };
        })
      );
    }
  }, [businessId, isLoadingTempImages, tempBusinessImages, setValue]);

  // --- Handlers ---
  const handleBusinessWebsite = (value: string) => {
    if (value && !value.startsWith("https://")) {
      setValue("website", "https://" + value);
    } else {
      setValue("website", value);
    }
  };

  const handleImageDelete = async (idToDelete: string) => {
    try {
      setIsImageDeleting((prev) => [...prev, idToDelete]);
      await deleteBusinessImage.mutateAsync({
        imageId: idToDelete,
        businessId: businessId || user?.$id!,
      });
      // Update form state
      setValue(
        "images",
        businessImages.filter((img) => img.$id !== idToDelete)
      );
      setIsImageDeleting((prev) => prev.filter((id) => id !== idToDelete));
    } catch (err) {
      console.error("Failed to delete image", err);
      toast("Error", { description: "Failed to delete image" });
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
          // Update form state
          setValue("images", [
            ...businessImages,
            ...result.map((image) => ({
              ...image,
              createdAt: new Date(image.createdAt),
            })),
          ]);
        }
      } catch (err) {
        console.error("Failed to upload image", err);
      }
    }

    setIsImageUploading(false);
  };

  const handleToggleBusinessStatus = (status?: string) => {
    if (!user || !businessId) return;
    const newStatus = status === "active" ? "disabled" : "active";
    setValue("status", newStatus);
  };

  const onSubmitRHF = async (data: BusinessFormValues) => {
    console.log("Handling submit!");
    if (!businessId && !agreedToTerms) {
      // Only set terms error in create mode
      // Need to handle terms error state separately or add to schema
      console.error("Please accept the terms and conditions.");
      // You might want to set a separate state for terms error or use RHF's setError
      setError("agreedToTerms", {
        type: "manual",
        message: "Please accept the terms and conditions.",
      });
      return;
    }

    // Transform data to match the expected onSubmit format
    const formData = {
      name: data.name,
      about: data.about,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      country: data.country,
      phoneCountryCode: data.phoneCountryCode,
      phoneNumber: data.phoneNumber,
      categories: data.category,
      services: data.services,
      paymentOptions: data.paymentOptions,
      hours: data.hours,
      images: data.images,
      email: data.email,
      website: data.website === "https://" ? null : data.website,
      maxPrice: data.maxPrice,
      on_site_parking: data.on_site_parking,
      garage_parking: data.garage_parking,
      wifi: data.wifi,
    };

    console.log(formData);

    await onSubmit(formData);
  };

  console.log(errors);

  return (
    <div className="container mx-auto py-8 px-4 md:px-8 lg:px-16 space-y-8">
      <div className="flex flex-col-reverse gap-4 md:flex-row justify-between items-start">
        {/* Business Name */}
        <div className="md:w-1/2">
          <Label htmlFor="businessName" className="font-semibold">
            <span className="text-destructive">*</span> Name of Business
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Input name of the business below
          </p>
          <Input
            id="businessName"
            {...register("name")}
            required
            placeholder="Enter business name"
            className={`mt-1 w-[100%] ${errors.name ? "border-red-500" : ""}`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Input full name, ensure there are no special characters
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {businessId && (
            <Button
              variant={status === "active" ? "destructive" : "outline"}
              className="rounded-4xl"
              onClick={() => handleToggleBusinessStatus(status)}
            >
              {status === "active" ? "Disable" : "Enable"} Business
            </Button>
          )}
          {businessId && (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          )}
          {/* --- Verify Business Button & Modal (Edit Mode Only) --- */}
          {businessId && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <ShieldCheck className="mr-2 h-4 w-4" /> Verify Business
                </Button>
              </DialogTrigger>
              <DialogContent className="w-screen">
                <DialogHeader>
                  <DialogTitle>Business Verification</DialogTitle>
                  <DialogDescription>
                    Upload a document to verify your business ownership (e.g.,
                    utility bill, business registration). This helps build trust
                    with customers.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <VerificationUpload businessId={businessId} />
                </div>
              </DialogContent>
            </Dialog>
          )}
          {/* --- End Verify Business Button & Modal --- */}
        </div>
      </div>

      {/* About the Business */}
      <div className="md:w-3/4">
        <Label htmlFor="aboutBusiness" className="font-semibold">
          <span className="text-destructive">*</span> About the Business
        </Label>
        <Textarea
          id="aboutBusiness"
          {...register("about")}
          required
          placeholder="Describe the business..."
          className={`min-h-[100px] mt-2 ${
            errors.about ? "border-red-500" : ""
          }`}
        />
        {errors.about && (
          <p className="text-red-500 text-sm mt-1">{errors.about.message}</p>
        )}
      </div>

      {/* Business Photo/Videos */}
      <div>
        <Label className="font-semibold block mb-2">
          Business photo/videos
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {businessImages.map((image, index) => (
            <Card
              key={image.$id}
              className="relative group aspect-square overflow-hidden"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-[5] z-2 h-6 w-6 transition-opacity p-1 bg-red-500 text-white hover:bg-gray-200"
                onClick={() => handleImageDelete(image.$id)}
                aria-label="Delete image"
              >
                <X className="h-4 w-4" />
              </Button>
              <Image
                src={image.imageUrl!}
                alt={image.title || "Business Image"}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                style={{ objectFit: "cover" }}
                priority={index < 3}
                className={
                  isImageDeleting.includes(image.$id) ? "opacity-50" : ""
                }
              />

              {isImageDeleting.includes(image.$id) && (
                <div className="absolute top-1 flex items-center justify-center w-full h-full">
                  <LoadingSVG />
                </div>
              )}
            </Card>
          ))}

          {(isLoadingTempImages || isImageUploading) && (
            <div className="flex items-center justify-center w-full h-full">
              <LoadingSVG />
            </div>
          )}

          {/* Add Photo Button */}
          <Label
            htmlFor="imageUpload"
            className="flex flex-col items-center justify-center aspect-square cursor-pointer transition-colors"
          >
            <Plus className="h-15 w-15 text-muted-foreground border border-input bg-gray-100 hover:bg-gray-200 rounded-full p-[5%]" />
            <span className="sr-only">Add photo/video</span>
            <Input
              id="imageUpload"
              type="file"
              multiple
              className="sr-only"
              accept="image/*, video/*"
              onChange={handleImageUpload}
            />
          </Label>
        </div>
        {errors.images && (
          <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>
        )}
      </div>

      {/* --- Business Address Section (Extracted Component) --- */}
      <BusinessFormAddress
        // Pass RHF props down
        register={register}
        errors={errors}
        control={form.control}
        setValue={setValue}
        watch={watch}
      />
      {/* --- End Business Address Section --- */}

      {/* Business Email & Website */}
      <div className="flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-grow">
          <Label htmlFor="businessEmail" className="font-semibold">
            <span className="text-destructive">*</span> Business Email
          </Label>
          <Input
            id="businessEmail"
            type="email"
            {...register("email")}
            placeholder="Enter business email"
            className="mt-2"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        <div className="flex-grow">
          <Label htmlFor="businessWebsite" className="font-semibold">
            Business Website
          </Label>
          <Input
            id="businessWebsite"
            type="url"
            {...register("website")}
            onChange={(e) => handleBusinessWebsite(e.target.value)} // Keep custom handler for prefix
            placeholder="https://checkaroundme.com"
            className="mt-2"
          />
          {errors.website && (
            <p className="text-red-500 text-sm mt-1">
              {errors.website.message}
            </p>
          )}
        </div>
      </div>

      {/* Business Category */}
      <div className="md:w-1/2">
        <Label htmlFor="businessCategory" className="font-semibold">
          Business Category
        </Label>
        {/* Business Category Select (requires Controller or manual state management with setValue) */}
        {/* For simplicity in this diff, I'll keep the current state management and update it later if needed. */}
        <Select
          value={businessCategory}
          onValueChange={(value) => setValue("category", value)}
        >
          <SelectTrigger id="businessCategory" className="w-full mt-2">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {businessCategories?.map((category) => (
              <SelectItem key={category.$id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      {/* --- Services Offered Section (Extracted Component) --- */}
      <BusinessFormServices
        // Pass RHF props down
        register={register}
        errors={errors}
        control={form.control}
        setValue={setValue}
        watch={watch}
        // No longer passing individual service state/handlers
      />
      {/* --- End Services Offered Section --- */}

      {/* --- Payment Options Section (Extracted Component) --- */}
      <BusinessFormPayment
        // Pass RHF props down
        register={register}
        errors={errors}
        control={form.control}
        setValue={setValue}
        watch={watch}
        // No longer passing individual payment state/handlers
      />
      {/* --- End Payment Options Section --- */}

      {/* Price Indicator */}
      <div className="md:w-1/2">
        <Label htmlFor="maxPrice" className="font-semibold">
          Price Indicator
        </Label>
        <p className="text-sm text-muted-foreground mb-2">
          Select the typical maximum price range for your main
          services/products.
        </p>
        {/* Price Indicator Select (requires Controller or manual state management with setValue) */}
        {/* For simplicity in this diff, I'll keep the current state management and update it later if needed. */}
        <Select
          value={maxPrice?.toString()}
          onValueChange={(value) =>
            setValue("maxPrice", Number.parseFloat(value))
          }
        >
          <SelectTrigger id="maxPrice" className="w-full mt-2">
            <SelectValue placeholder="Select maximum price range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1000">NGN 1,000</SelectItem>
            <SelectItem value="10000">NGN 10,000</SelectItem>
            <SelectItem value="100000">NGN 100,000</SelectItem>
            <SelectItem value="1000000">NGN 1,000,000</SelectItem>
            <SelectItem value="10000000">NGN 10,000,000</SelectItem>
          </SelectContent>
        </Select>
        {errors.maxPrice && (
          <p className="text-red-500 text-sm mt-1">{errors.maxPrice.message}</p>
        )}
      </div>

      {/* Additional Features (Parking, Wifi) */}
      <div>
        <Label className="font-semibold block mb-2">Additional Features</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Select features available at your business location.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="onSiteParking"
              className="data-[state=checked]:bg-primary"
              checked={onSiteParking} // This is now watched from RHF
              onCheckedChange={(checked) =>
                setValue("on_site_parking", checked as boolean)
              } // Update RHF state
            />
            <Label htmlFor="onSiteParking">On-Site Parking</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="garageParking"
              className="data-[state=checked]:bg-primary"
              checked={garageParking} // This is now watched from RHF
              onCheckedChange={(checked) =>
                setValue("garage_parking", checked as boolean)
              } // Update RHF state
            />
            <Label htmlFor="garageParking">Garage Parking</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="wifi"
              className="data-[state=checked]:bg-primary"
              checked={wifi} // This is now watched from RHF
              onCheckedChange={(checked) =>
                setValue("wifi", checked as boolean)
              } // Update RHF state
            />
            <Label htmlFor="wifi">Wifi Available</Label>
          </div>
        </div>
        {errors.on_site_parking && (
          <p className="text-red-500 text-sm mt-1">
            {errors.on_site_parking.message}
          </p>
        )}
        {errors.garage_parking && (
          <p className="text-red-500 text-sm mt-1">
            {errors.garage_parking.message}
          </p>
        )}
      </div>

      {/* --- Available Hours Section (Extracted Component) --- */}
      <BusinessFormHours
        // Pass RHF props down
        register={register}
        errors={errors}
        control={form.control}
        setValue={setValue}
        watch={watch}
        // No longer passing individual hours state/handlers
      />

      {/* Terms and Conditions Checkbox (only in create mode) */}
      {!businessId && (
        <div className="flex items-center space-x-2 pt-4">
          <Checkbox
            id="terms"
            checked={agreedToTerms} // This is now watched from RHF
            onCheckedChange={(checked) =>
              setValue("agreedToTerms", checked as boolean)
            } // Update RHF state
            className="data-[state=checked]:bg-primary"
            required // RHF handles required validation
          />
          <Label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I agree to the{" "}
            <a
              href="/business/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600 hover:text-blue-800"
            >
              Terms and Conditions
            </a>
            <span className="text-destructive">*</span>
          </Label>
          {errors.agreedToTerms && (
            <p className="text-red-500 text-sm mt-1">
              {errors.agreedToTerms.message}
            </p>
          )}
        </div>
      )}

      {/* Cancel Button */}
      <div className="flex justify-end gap-4 pt-4">
        <Button
          className="rounded-4xl bg-primary"
          onClick={handleSubmit(onSubmitRHF, (event) => {
            for (const key of Object.keys(errors)) {
              // @ts-ignore
              errors[key].message && toast.error(errors[key].message);
            }
          })}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : submitButtonText}
        </Button>
        <Button
          variant="outline"
          onClick={() => window.history.back()} // Use window.history.back() for broader compatibility
          className="rounded-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
