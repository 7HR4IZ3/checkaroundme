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
import { X, Plus, Trash2, MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/hooks/useClientAuth";
import { BusinessImage } from "@/lib/schema";

export default function BusinessCreateForm() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.push("/auth");
    return null;
  }

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
  const [paymentOptions, setPaymentOptions] = useState<{
    cash: boolean;
    transfer: boolean;
  }>({
    cash: true,
    transfer: true,
  });
  const [availableHours, setAvailableHours] = useState<{
    [key: string]: { start?: string; end?: string; closed?: boolean };
  }>({
    Mon: { start: "09:00", end: "18:00", closed: false },
    Tue: { start: "09:00", end: "18:00", closed: false },
    Wed: { start: "09:00", end: "18:00", closed: false },
    Thu: { start: "09:00", end: "18:00", closed: false },
    Fri: { start: "09:00", end: "18:00", closed: false },
    Sat: { start: "09:00", end: "18:00", closed: false },
    Sun: { start: "09:00", end: "18:00", closed: true },
  });
  const [createdBusinessId, setCreatedBusinessId] = useState<string | null>(
    null
  );
  const [newService, setNewService] = useState("");

  const updateBusinessHours = (
    day: string,
    type: "start" | "end" | "closed",
    value: string | boolean
  ) => {
    console.log(day, type, value);
    setAvailableHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value,
      },
    }));
  };

  const { data: businessCategories } = trpc.getAllCategories.useQuery();

  // --- tRPC mutations ---
  const createBusiness = trpc.createBusiness.useMutation();
  // const uploadBusinessImage = trpc.uploadBusinessImage.useMutation();
  const uploadTempBusinessImage = trpc.uploadTempBusinessImage.useMutation();
  const deleteBusinessImage = trpc.deleteBusinessImage.useMutation();

  // --- Handlers ---
  const handleImageDelete = async (idToDelete: string) => {
    if (!createdBusinessId) return;
    try {
      await deleteBusinessImage.mutateAsync({ imageId: idToDelete });
      setBusinessImages((prev) => prev.filter((img) => img.$id !== idToDelete));
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
        console.log(files);

        const form = new FormData();
        form.append("file", file);
        form.append("userID", user.$id);

        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: form,
        });

        if (response.ok) {
          const result: BusinessImage = await response.json();
          setBusinessImages((prev) => [...prev, result]);
        }
      } catch (err) {
        console.error("Failed to upload image", err);
      }
    }
  };

  const handleSetPaymentOption = (option: string, value: boolean) => {
    setPaymentOptions((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setServicesOffered(
      servicesOffered.filter((service) => service !== serviceToRemove)
    );
  };

  const handleAddService = () => {
    const trimmedService = newService.trim();
    if (trimmedService && !servicesOffered.includes(trimmedService)) {
      setServicesOffered([...servicesOffered, trimmedService]);
      setNewService(""); // Clear the input
    }
  };

  const handleSave = async () => {
    const userId = user.$id;
    try {
      const result = await createBusiness.mutateAsync({
        name: businessName,
        about: aboutBusiness,
        addressLine1,
        addressLine2,
        city,
        country,
        ownerId: userId,
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
    <div className="container mx-auto py-8 px-4 md:px-8 lg:px-16 space-y-8">
      <div className="flex justify-between items-center">
        {/* <h1 className="text-2xl font-bold">Create a New Business</h1> */}
        {createdBusinessId && (
          <div className="flex items-center gap-2">
            {/* Removed size="sm" for default button size */}
            <Button variant="destructive">Disable Business</Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </div>
        )}
      </div>
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
          value={businessName}
          required
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Enter business name"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Input full name, ensure there are no special characters
        </p>
      </div>

      {/* About the Business */}
      <div className="md:w-3/4">
        <Label htmlFor="aboutBusiness" className="font-semibold">
          <span className="text-destructive">*</span> About the Business
        </Label>
        <Textarea
          id="aboutBusiness"
          value={aboutBusiness}
          required
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
              key={image.$id}
              className="relative group aspect-square overflow-hidden"
            >
              <Image
                src={image.imageUrl}
                alt={image.title || "Business Image"}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                style={{ objectFit: "cover" }}
                priority={index < 3}
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity p-1" // Adjusted padding
                onClick={() => handleImageDelete(image.$id)}
                aria-label="Delete image"
                // disabled={!createdBusinessId}
              >
                <Trash2 className="h-4 w-4" /> {/* Changed icon to Trash2 */}
              </Button>
            </Card>
          ))}
          {/* Add Photo Button */}
          <Label
            htmlFor="imageUpload"
            className="flex flex-col items-center justify-center aspect-square cursor-pointer transition-colors"
          >
            {/* Slightly larger Plus icon */}
            <Plus className="h-15 w-15 text-muted-foreground border border-input bg-gray-100 hover:bg-gray-200 rounded-full p-[5%]" />
            <span className="sr-only">Add photo/video</span>{" "}
            {/* Keep sr-only for accessibility */}
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

      {/* Business Address */}
      {/* <div>
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
      </div> */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <Label htmlFor="addressLine1" className="font-semibold">
            <span className="text-destructive">*</span> Business Address Line 1
          </Label>
          <Input
            id="addressLine1"
            value={addressLine1}
            required
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder="Enter address line 1"
            className="mt-2"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="city" className="font-semibold">
            <span className="text-destructive">*</span> City
          </Label>
          <Select value={city} onValueChange={setCity} required>
            <SelectTrigger id="city" className="mt-2">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {/* TODO: Populate dynamically based on selected country */}
              <SelectItem value="Lagos">Lagos</SelectItem>
              <SelectItem value="Abuja">Abuja</SelectItem>
              <SelectItem value="Accra">Accra</SelectItem>
              <SelectItem value="London">London</SelectItem>
              <SelectItem value="New York">New York</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label htmlFor="country" className="font-semibold">
            <span className="text-destructive">*</span> Country
          </Label>
          <Select value={country} onValueChange={setCountry} required>
            <SelectTrigger id="country" className="mt-2">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {/* TODO: Populate with actual countries */}
              <SelectItem value="Nigeria">Nigeria</SelectItem>
              <SelectItem value="Ghana">Ghana</SelectItem>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="United States">United States</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Phone Number */}
        <div className="flex-grow">
          <Label htmlFor="phoneNumber" className="font-semibold">
            Phone number
          </Label>
          <div className="flex gap-2 mt-2">
            <Select
              value={phoneCountryCode}
              onValueChange={setPhoneCountryCode}
            >
              <SelectTrigger id="phoneCountryCode" className="w-24">
                <SelectValue placeholder="Code" />
              </SelectTrigger>
              <SelectContent>
                {/* TODO: Populate with actual country codes */}
                <SelectItem value="+234">+234</SelectItem>
                <SelectItem value="+1">+1</SelectItem>
                <SelectItem value="+44">+44</SelectItem>
                <SelectItem value="+233">+233</SelectItem>
              </SelectContent>
            </Select>
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
      </div>

      {/* Business Category */}
      <div className="md:w-1/2">
        <Label htmlFor="businessCategory" className="font-semibold">
          Business Category
        </Label>
        <Select value={businessCategory} onValueChange={setBusinessCategory}>
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
      </div>

      {/* Services Offered */}
      <div>
        <Label className="font-semibold block mb-2">Services Offered</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Add or remove services your business offers
        </p>
        {/* Input to add new service */}
        <div className="flex gap-2 mb-4">
          <Input
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            placeholder="Enter a service (e.g., Haircut)"
            className="flex-grow"
            onKeyDown={(e) => {
              // Add service on Enter key press
              if (e.key === 'Enter') {
                e.preventDefault(); // Prevent potential form submission
                handleAddService();
              }
            }}
          />
          <Button onClick={handleAddService} type="button"> {/* Use type="button" to prevent form submission */}
            Add Service
          </Button>
        </div>
        {/* Display existing services */}
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

      {/* Payment Options */}
      <div>
        <Label className="font-semibold block mb-2">Payment Options</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Select payment options your business accepts
        </p>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cashPayment"
              checked={paymentOptions.cash}
              onCheckedChange={(ev) =>
                handleSetPaymentOption("cash", ev.valueOf() as boolean)
              }
            />
            <Label htmlFor="cashPayment">Cash Payment</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="transfer"
              checked={paymentOptions.transfer}
              onCheckedChange={(ev) =>
                handleSetPaymentOption("transfer", ev.valueOf() as boolean)
              }
            />
            <Label htmlFor="transfer">Transfer</Label>
          </div>
        </div>
      </div>

      {/* Available Hours */}
      <div className="">
        <Label className="font-semibold block mb-2">Available hours</Label>
        <div className="space-y-2 text-sm text-muted-foreground mt-2">
          {Object.entries(availableHours).map(([day, hours]) => (
            <div key={day} className="flex items-center gap-8">
              <span className="w-1/5 font-medium text-card-foreground">
                {day}
              </span>
              <div className="flex flex-row">
                <Input
                  type="time"
                  className="border-0 border-bottom"
                  value={availableHours[day].start}
                  onChange={(ev) =>
                    updateBusinessHours(day, "start", ev.target.value)
                  }
                  disabled={availableHours[day].closed}
                  name={day + "-start"}
                ></Input>{" "}
                <span className="flex items-center">-</span>
                <Input
                  type="time"
                  className="border-0 border-bottom"
                  value={availableHours[day].end}
                  onChange={(ev) =>
                    updateBusinessHours(day, "end", ev.target.value)
                  }
                  disabled={availableHours[day].closed}
                  name={day + "-end"}
                ></Input>
              </div>
              <span className="flex items-center gap-3">
                <Label htmlFor={day + "-closed"}>Closed</Label>
                <Checkbox
                  className="h-5 w-5"
                  id={day + "-closed"}
                  name={day + "-closed"}
                  checked={availableHours[day].closed}
                  onCheckedChange={(ev) =>
                    updateBusinessHours(day, "closed", ev.valueOf())
                  }
                />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        {/* Added rounded-full to action buttons */}
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="rounded-full"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={createBusiness.status === "pending" || !!createdBusinessId}
          className="rounded-full"
        >
          {createBusiness.status === "pending" ? "Creating..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
