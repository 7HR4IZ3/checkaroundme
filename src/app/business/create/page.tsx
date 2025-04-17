"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import Image from "next/image";
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
import { X, Plus, Trash2 } from "lucide-react";

interface BusinessImage {
  id: string;
  url: string;
  alt: string;
}

export default function BusinessCreateForm() {
  const router = useRouter();

  // --- State Hooks ---
  const [businessName, setBusinessName] = useState("");
  const [aboutBusiness, setAboutBusiness] = useState("");
  const [businessImages, setBusinessImages] = useState<BusinessImage[]>([]);
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+234");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [servicesOffered, setServicesOffered] = useState<string[]>([]);
  const [availableHours, setAvailableHours] = useState<
    { day: string; hours: { start: string; end: string } | { closed: true } }[]
  >([
    { day: "Mon", hours: { start: "9:00 AM", end: "6:00 PM" } },
    { day: "Tue", hours: { start: "9:00 AM", end: "6:00 PM" } },
    { day: "Wed", hours: { start: "9:00 AM", end: "6:00 PM" } },
    { day: "Thu", hours: { start: "9:00 AM", end: "6:00 PM" } },
    { day: "Fri", hours: { start: "9:00 AM", end: "6:00 PM" } },
    { day: "Sat", hours: { start: "9:00 AM", end: "6:00 PM" } },
    { day: "Sun", hours: { closed: true } },
  ]);
  // For image upload after business is created
  const [createdBusinessId, setCreatedBusinessId] = useState<string | null>(
    null
  );
  const [localBusinessImages, setlocalBusinessImages] = useState<
    BusinessImage[]
  >([]);

  // --- tRPC mutations ---
  const createBusiness = trpc.createBusiness.useMutation();
  const uploadBusinessImage = trpc.uploadBusinessImage.useMutation();
  const uploadTempBusinessImage = trpc.uploadTempBusinessImage.useMutation();
  const deleteBusinessImage = trpc.deleteBusinessImage.useMutation();

  // --- Handlers ---
  const handleImageDelete = async (idToDelete: string) => {
    if (!createdBusinessId) return;
    try {
      await deleteBusinessImage.mutateAsync({ imageId: idToDelete });
      setBusinessImages((prev) => prev.filter((img) => img.id !== idToDelete));
    } catch (err) {
      console.error("Failed to delete image", err);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      try {
        const file = files[0];

        if (!createdBusinessId) {
          const result = await uploadTempBusinessImage.mutateAsync({ file });
          setlocalBusinessImages((prev) => [
            ...prev,
            {
              id: result.id,
              url: result.url,
              alt: result.alt || "Business image",
            },
          ]);
        } else {
          const result = await uploadBusinessImage.mutateAsync({
            businessId: createdBusinessId,
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
        }
      } catch (err) {
        console.error("Failed to upload image", err);
      }
    }
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setServicesOffered(
      servicesOffered.filter((service) => service !== serviceToRemove)
    );
  };

  const handleSave = async () => {
    // You may want to get the userId from auth context or session
    const userId = ""; // TODO: Replace with actual userId
    try {
      const result = await createBusiness.mutateAsync({
        name: businessName,
        about: aboutBusiness,
        addressLine1,
        addressLine2,
        city,
        country,
        ownerId: userId, // TODO: Use actual ownerId if different from userId
        phone: phoneNumber,
        categories: businessCategory ? [businessCategory] : [],
        services: servicesOffered,
        userId,
      });
      setCreatedBusinessId(result.$id);
      // Optionally redirect to the new business page
      router.push(`/business/${result.$id}`);
    } catch (err) {
      console.error("Failed to create business", err);
    }
  };

  return (
    <div className="container mx-auto p-6 my-6 border rounded-lg shadow-sm bg-card text-card-foreground space-y-6">
      <h1 className="text-2xl font-bold mb-4">Create a New Business</h1>
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
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Enter business name"
        />
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

      {/* Business Address */}
      <div>
        <Label htmlFor="addressLine1" className="font-semibold">
          Business Address Line 1
        </Label>
        <Input
          id="addressLine1"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
          placeholder="Enter address line 1"
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="addressLine2" className="font-semibold">
          Business Address Line 2
        </Label>
        <Input
          id="addressLine2"
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
          placeholder="Enter address line 2"
          className="mt-2"
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="city" className="font-semibold">
            City
          </Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city"
            className="mt-2"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="country" className="font-semibold">
            Country
          </Label>
          <Input
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Enter country"
            className="mt-2"
          />
        </div>
      </div>

      {/* Business Photo/Videos */}
      <div>
        <Label className="font-semibold block mb-2">
          Business photo/videos
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {localBusinessImages.map((image, index) => (
            <Card
              key={image.id}
              className="relative group aspect-square overflow-hidden"
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                style={{ objectFit: "cover" }}
                priority={index < 3}
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleImageDelete(image.id)}
                aria-label="Delete image"
                // disabled={!createdBusinessId}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
          {/* Add Photo Button */}
          <Label
            htmlFor="imageUpload"
            className={`flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted-foreground rounded-lg cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors opacity-50 pointer-events-none`}
          >
            <Plus className="h-10 w-10 text-muted-foreground" />
            <span className="sr-only">Add photo/video</span>
            <Input
              id="imageUpload"
              type="file"
              className="sr-only"
              accept="image/*, video/*"
              onChange={handleImageUpload}
              // disabled={!createdBusinessId}
            />
          </Label>
        </div>
        {/* {!createdBusinessId && (
          <p className="text-xs text-muted-foreground">
            You can upload images after creating the business.
          </p>
        )} */}
      </div>

      {/* Phone Number */}
      <div>
        <Label htmlFor="phoneNumber" className="font-semibold">
          Phone number
        </Label>
        <div className="flex gap-2 mt-2">
          <Input
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
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
            className="flex-1"
            aria-label="Phone number"
          />
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
        </div>
      </div>

      {/* Available Hours (Display Only based on Design) */}
      <div>
        <Label className="font-semibold block mb-2">Available hours</Label>
        <div className="space-y-1 text-sm text-muted-foreground">
          {availableHours.map((item) => (
            <div key={item.day} className="flex justify-between">
              <span>{item.day}</span>
              <span className="flex flex-row">
                {item.hours.closed ? (
                  "Closed"
                ) : (
                  <>
                    <span>{item.hours.start}</span> - <span>{item.hours.end}</span> 
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        <Button
          onClick={handleSave}
          disabled={createBusiness.status === "pending" || !!createdBusinessId}
        >
          {createBusiness.status === "pending" ? "Creating..." : "Create"}
        </Button>
      </div>
    </div>
  );
}
