// src/components/BusinessEditForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import Image from "next/image"; // Use next/image for optimization
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
import { Card, CardContent } from "@/components/ui/card"; // For image previews
import { X, Plus, Trash2 } from "lucide-react"; // Icons

// Mock data structure for images and services
interface BusinessImage {
  id: string;
  url: string;
  alt: string;
}

// Mock available hours structure

export default function BusinessEditForm() {
  // --- State Hooks ---
  const [businessName, setBusinessName] = useState("");
  const [aboutBusiness, setAboutBusiness] = useState("");
  const [businessImages, setBusinessImages] = useState<BusinessImage[]>([]);
  const [businessAddress, setBusinessAddress] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+234");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [servicesOffered, setServicesOffered] = useState<string[]>([]);
  const [availableHours, setAvailableHours] = useState<
    { day: string; hours: string }[]
  >([]);
  // Add state for adding new service if needed
  // const [newService, setNewService] = useState("");

  // --- tRPC: Get businessId from params and fetch data ---
  const params = useParams();
  const businessId =
    typeof params.businessId === "string"
      ? params.businessId
      : Array.isArray(params.businessId)
      ? params.businessId[0]
      : "";

  const {
    data: business,
    isLoading: isBusinessLoading,
    error: businessError,
  } = trpc.getBusinessById.useQuery({ businessId }, { enabled: !!businessId });
  const {
    data: images,
    isLoading: isImagesLoading,
    error: imagesError,
  } = trpc.getBusinessImages.useQuery(
    { businessId },
    { enabled: !!businessId }
  );
  const {
    data: hours,
    isLoading: isHoursLoading,
    error: hoursError,
  } = trpc.getBusinessHours.useQuery({ businessId }, { enabled: !!businessId });

  // --- Populate form state when data loads ---
  useEffect(() => {
    if (business) {
      setBusinessName(business.name ?? "");
      setAboutBusiness(business.about ?? "");
      setBusinessAddress(
        [business.addressLine1, business.addressLine2].filter(Boolean).join(" ")
      );
      setPhoneNumber(business.phone ?? "");
      setBusinessCategory(business.categories?.[0] ?? "");
      setServicesOffered(business.services ?? []);
    }
    if (images) {
      setBusinessImages(
        images.map((img) => ({
          id: img.$id,
          url: img.imageUrl,
          alt: img.title || "Business image",
        }))
      );
    }
    if (hours) {
      setAvailableHours(
        hours.map((h) => ({
          day: h.day,
          hours: h.isClosed
            ? "Closed"
            : `${h.openTime ?? ""} - ${h.closeTime ?? ""}`,
        }))
      );
    }
  }, [business, images, hours]);

  // --- Handlers (Basic Placeholders) ---
  // --- tRPC mutations ---
  const updateBusiness = trpc.updateBusiness.useMutation();
  const uploadBusinessImage = trpc.uploadBusinessImage.useMutation();
  const deleteBusinessImage = trpc.deleteBusinessImage.useMutation();

  // --- Handlers ---
  const handleImageDelete = async (idToDelete: string) => {
    try {
      await deleteBusinessImage.mutateAsync({ imageId: idToDelete });
      setBusinessImages((prev) => prev.filter((img) => img.id !== idToDelete));
    } catch (err) {
      // Optionally show error UI
      console.error("Failed to delete image", err);
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files.length > 0 && businessId) {
      setIsUploading(true);
      try {
        const file = files[0];
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image size must be less than 5MB');
        }
        
        const result = await uploadBusinessImage.mutateAsync({
          businessId,
          file,
        });
        setBusinessImages((prev) => [
          ...prev,
          {
            id: result.$id,
            url: result.imageUrl,
            alt: result.title || "Business image",
          },
        ]);
      } catch (err) {
        setErrors({
          ...errors,
          imageUpload: err instanceof Error ? err.message : 'Failed to upload image'
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setServicesOffered(
      servicesOffered.filter((service) => service !== serviceToRemove)
    );
    console.log("Remove service:", serviceToRemove);
  };

  // const handleAddService = () => {
  //   if (newService.trim() && !servicesOffered.includes(newService.trim())) {
  //     setServicesOffered([...servicesOffered, newService.trim()]);
  //     setNewService(""); // Clear input
  //   }
  // };

  const handleCancel = () => {
    console.log("Cancel changes");
    // Add reset logic or navigation
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    
    if (phoneNumber && !/^[0-9]{10,15}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!businessId) return;
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      await updateBusiness.mutateAsync({
        businessId,
        data: {
          name: businessName,
          about: aboutBusiness,
          addressLine1: businessAddress,
          phone: phoneNumber,
          categories: businessCategory ? [businessCategory] : [],
          services: servicesOffered,
        },
      });
      // TODO: Add success toast/notification
    } catch (err) {
      setErrors({
        ...errors,
        form: err instanceof Error ? err.message : 'Failed to save business'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 border rounded-lg shadow-sm bg-card text-card-foreground space-y-6 relative">
      {errors.form && (
        <div className="p-4 mb-6 text-sm text-destructive bg-destructive/10 rounded-md">
          {errors.form}
        </div>
      )}
      {/* Business Name */}
      <div>
        <Label htmlFor="businessName" className="font-semibold">
          <span className="text-destructive">*</span> Name of Business
        </Label>
        <p className="text-sm text-muted-foreground mb-2">
          Input name of the business below
        </p>
        <Input
          id="businessName"
          value={businessName}
          onChange={(e) => {
            setBusinessName(e.target.value);
            setErrors({...errors, businessName: ''});
          }}
          placeholder="Enter business name"
          className={errors.businessName ? 'border-destructive' : ''}
        />
        {errors.businessName && (
          <p className="text-xs text-destructive mt-1">{errors.businessName}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Input full name, ensure there are no special characters
        </p>
      </div>

      {/* About the Business */}
      <div>
        <Label htmlFor="aboutBusiness" className="font-semibold">
          About the Business
        </Label>
        <Textarea
          id="aboutBusiness"
          value={aboutBusiness}
          onChange={(e) => setAboutBusiness(e.target.value)}
          placeholder="Describe the business..."
          className="min-h-[100px] mt-2"
        />
      </div>

      {/* Business Photo/Videos */}
      <div>
        <Label className="font-semibold block mb-2">
          Business photo/videos
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {businessImages.map((image, index) => (
            <Card
              key={image.id}
              className="relative group aspect-square overflow-hidden"
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill // Use fill to cover the card area
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw" // Optimize image loading
                style={{ objectFit: "cover" }} // Ensure image covers the area
                priority={index < 3}
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleImageDelete(image.id)}
                aria-label="Delete image"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
          {/* Add Photo Button */}
          <Label
            htmlFor="imageUpload"
            className={`flex items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isUploading
                ? 'border-primary bg-muted/50'
                : errors.imageUpload
                  ? 'border-destructive'
                  : 'border-muted-foreground hover:border-primary hover:bg-muted/50'
            }`}
          >
            {isUploading ? (
              <div className="animate-spin h-5 w-5 border-2 border-primary rounded-full border-t-transparent" />
            ) : (
              <>
                <Plus className="h-10 w-10 text-muted-foreground" />
                <span className="sr-only">Add photo/video</span>
                <Input
                  id="imageUpload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </>
            )}
          </Label>
          {errors.imageUpload && (
            <p className="text-xs text-destructive mt-1">{errors.imageUpload}</p>
          )}
        </div>
      </div>

      {/* Business Address */}
      <div>
        <Label htmlFor="businessAddress" className="font-semibold">
          Business Address
        </Label>
        <Input
          id="businessAddress"
          value={businessAddress}
          onChange={(e) => setBusinessAddress(e.target.value)}
          placeholder="Enter business address"
          className="mt-2"
        />
      </div>

      {/* Phone Number */}
      <div>
        <Label htmlFor="phoneNumber" className="font-semibold">
          Phone number
        </Label>
        <div className="flex gap-2 mt-2">
          <Input
            // For simplicity, keeping country code as Input. Could be Select if needed.
            id="phoneCountryCode"
            value={phoneCountryCode}
            onChange={(e) => setPhoneCountryCode(e.target.value)}
            className="w-20"
            aria-label="Country code"
          />
          <Input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              setErrors({...errors, phoneNumber: ''});
            }}
            placeholder="Enter phone number"
            className={`flex-1 ${errors.phoneNumber ? 'border-destructive' : ''}`}
            aria-label="Phone number"
          />
          {errors.phoneNumber && (
            <p className="text-xs text-destructive mt-1 col-span-2">
              {errors.phoneNumber}
            </p>
          )}
        </div>
      </div>

      {/* Business Category */}
      <div>
        <Label htmlFor="businessCategory" className="font-semibold">
          Business Category
        </Label>
        <Select value={businessCategory} onValueChange={setBusinessCategory}>
          <SelectTrigger id="businessCategory" className="w-full mt-2">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {/* Add more relevant categories */}
            <SelectItem value="auto-mechanics">Auto Mechanics</SelectItem>
            <SelectItem value="car-wash">Car Wash</SelectItem>
            <SelectItem value="tyre-shop">Tyre Shop</SelectItem>
            <SelectItem value="body-shop">Body Shop</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Services Offered */}
      <div>
        <Label className="font-semibold block mb-2">Services Offered</Label>
        <div className="flex flex-wrap gap-2">
          {servicesOffered.map((service) => (
            <Badge
              key={service}
              variant="secondary"
              className="py-1 px-2 text-sm"
            >
              {service}
              <button
                onClick={() => handleRemoveService(service)}
                className="ml-1.5 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label={`Remove ${service}`}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          {/* Optional: Add Input for new service tags */}
          {/*
             <div className="flex gap-2 mt-2">
               <Input
                 value={newService}
                 onChange={(e) => setNewService(e.target.value)}
                 placeholder="Add a service"
                 className="h-8"
               />
               <Button onClick={handleAddService} size="sm" variant="outline">Add</Button>
            </div>
            */}
        </div>
      </div>

      {/* Available Hours (Display Only based on Design) */}
      <div>
        <Label className="font-semibold block mb-2">Available hours</Label>
        <div className="space-y-1 text-sm text-muted-foreground">
          {availableHours.map((item) => (
            <div key={item.day} className="flex justify-between">
              <span>{item.day}</span>
              <span>{item.hours}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
