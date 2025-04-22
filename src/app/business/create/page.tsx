"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import Image from "next/image";
import { toast } from "sonner"; // Import toast

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
import { LoadingSVG } from "@/components/ui/loading";

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
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [newService, setNewService] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+234");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [servicesOffered, setServicesOffered] = useState<string[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isImageDeleting, setIsImageDeleting] = useState<string[]>([]);

  // --- Error State Hooks ---
  const [businessNameError, setBusinessNameError] = useState("");
  const [aboutBusinessError, setAboutBusinessError] = useState("");
  const [addressLine1Error, setAddressLine1Error] = useState("");
  const [cityError, setCityError] = useState("");
  const [countryError, setCountryError] = useState("");
  const [termsError, setTermsError] = useState("");

  const [businessEmail, setBusinessEmail] = useState("");
  const [businessWebsite, setBusinessWebsite] = useState("https://");
  const [paymentOptions, setPaymentOptions] = useState<{
    [key: string]: boolean;
  }>({
    cash: true,
    transfer: true,
  });
  const [availableHours, setAvailableHours] = useState<{
    [key: string]: { open: string; close: string; closed: boolean };
  }>({
    Mon: { open: "09:00", close: "18:00", closed: false },
    Tue: { open: "09:00", close: "18:00", closed: false },
    Wed: { open: "09:00", close: "18:00", closed: false },
    Thu: { open: "09:00", close: "18:00", closed: false },
    Fri: { open: "09:00", close: "18:00", closed: false },
    Sat: { open: "09:00", close: "18:00", closed: false },
    Sun: { open: "09:00", close: "18:00", closed: true },
  });
  const [createdBusinessId, setCreatedBusinessId] = useState<string | null>(
    null
  );

  const [businessImages, setBusinessImages] = useState<BusinessImage[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false); // Added state for terms agreement

  // --- tRPC mutations ---
  const createBusiness = trpc.createBusiness.useMutation();
  const deleteBusinessImage = trpc.deleteBusinessImage.useMutation();

  const { data: tempBusinessImages, isLoading: isLoadingTempImages } =
    trpc.getBusinessImages.useQuery({ businessId: user.$id });
  const { data: businessCategories } = trpc.getAllCategories.useQuery();

  useEffect(() => {
    if (!isLoadingTempImages && tempBusinessImages) {
      setBusinessImages(tempBusinessImages);
    }
  }, [isLoadingTempImages]);

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
  // --- Handlers ---
  const handleBusinessWebsite = (value) => {
    if (!value || !value.startsWith("https://")) {
      value = "https://" + value
    }
    setBusinessWebsite(value);
  }

  const handleImageDelete = async (idToDelete: string) => {
    try {
      setIsImageDeleting((prev) => [...prev, idToDelete]);
      await deleteBusinessImage.mutateAsync({ imageId: idToDelete });
      setBusinessImages((prev) => prev.filter((img) => img.$id !== idToDelete));
      setIsImageDeleting((prev) => prev.filter((id) => id !== idToDelete));
    } catch (err) {
      console.error("Failed to delete image", err);
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

        form.append("userID", user.$id);

        const response = await fetch("/api/upload/images", {
          method: "POST",
          body: form,
        });

        if (response.ok) {
          const result: BusinessImage[] = await response.json();
          setBusinessImages((prev) => [...prev, ...result]);
        }
      } catch (err) {
        console.error("Failed to upload image", err);
      }
    }

    setIsImageUploading(false);
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

  const isFormValid = () => {
    return (
      businessName.trim() !== "" &&
      aboutBusiness.trim() !== "" &&
      addressLine1.trim() !== "" &&
      city.trim() !== "" &&
      country.trim() !== "" &&
      agreedToTerms // Check if terms are agreed
    );
  };

  const handleSave = async () => {
    // Clear previous errors
    setBusinessNameError("");
    setAboutBusinessError("");
    setAddressLine1Error("");
    setCityError("");
    setCountryError("");
    setTermsError("");

    if (!isFormValid()) {
      // Optionally show an error message to the user
      console.error(
        "Form is not valid. Please fill all required fields and agree to the terms."
      );
      if (!agreedToTerms) {
        setTermsError("Please accept the terms and conditions.");
      }
      return;
    }

    const userId = user.$id;
    try {
      console.log({
        name: businessName,
        about: aboutBusiness,
        addressLine1,
        addressLine2,
        city,
        country,
        ownerId: userId,
        phone: phoneCountryCode + phoneNumber,
        categories: businessCategory ? [businessCategory] : [],
        services: servicesOffered,
        userId,
        paymentOptions: Object.keys(paymentOptions).filter(
          (key) => paymentOptions[key]
        ),
        hours: availableHours,
        images: businessImages.map(({ isPrimary, $id }) => ({
          isPrimary,
          imageID: $id,
        })),
        email: businessEmail, // Added business email
        website: businessWebsite, // Added business website
      });

      const result = await createBusiness.mutateAsync({
        name: businessName,
        about: aboutBusiness,
        addressLine1,
        addressLine2,
        city,
        country,
        ownerId: userId,
        phone: phoneCountryCode + phoneNumber, // TODO: Sanitize this
        categories: businessCategory ? [businessCategory] : [],
        services: servicesOffered,
        userId,
        paymentOptions: Object.keys(paymentOptions).filter(
          (key) => paymentOptions[key]
        ),
        // @ts-ignore
        hours: availableHours,
        images: businessImages.map(({ isPrimary, $id }) => ({
          isPrimary,
          imageID: $id,
        })),
        email: businessEmail, // Added business email
        website: businessWebsite, // Added business website
      });
      setCreatedBusinessId(result.$id);
      // Optionally redirect to the new business page
      router.push(`/business/${result.$id}`);
    } catch (error: any) {
      console.error("Failed to create business", error);
      if (error.data?.httpStatus === 400) {
        const errors = JSON.parse(error.message);

        for (const item of errors) {
          if (item.path[0] === "name") {
            setBusinessNameError(item.message);
          } else if (item.path[0] === "about") {
            setAboutBusinessError(item.message);
          } else if (item.path[0] === "addressLine1") {
            setAddressLine1Error(item.message);
          } else if (item.path[0] === "city") {
            setCityError(item.message);
          } else if (item.path[0] === "country") {
            setCountryError(item.message);
          }
          // Add more error handling for other fields if needed
        }
      } else {
        // Handle other types of errors
        console.error("An unexpected error occurred:", error.message);
        // Show a generic error message to the user using toast
        toast("Failed to Create Business", {
          description: error.message || "An unexpected error occurred.",
        });
      }
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-8 lg:px-16 space-y-8">
      <div className="flex justify-between items-start">
        {/* <h1 className="text-2xl font-bold">Create a New Business</h1> */}
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
            onChange={(e) => {
              setBusinessName(e.target.value);
              setBusinessNameError(""); // Clear error on change
            }}
            placeholder="Enter business name"
            className={`mt-1 ${businessNameError ? "border-red-500" : ""}`} // Add error class
          />
          {businessNameError && (
            <p className="text-red-500 text-sm mt-1">{businessNameError}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Input full name, ensure there are no special characters
          </p>
        </div>

        {createdBusinessId ? (
          <div className="flex items-center gap-2">
            <Button variant="destructive" className="rounded-4xl">
              Disable Business
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              className="rounded-4xl bg-[#2E57A9]"
              onClick={handleSave}
              disabled={createBusiness.status === "pending" || !isFormValid()} // Disable if form is invalid or creating
            >
              {createBusiness.status === "pending"
                ? "Creating..."
                : "Create Business"}
            </Button>
          </div>
        )}
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
          onChange={(e) => {
            setAboutBusiness(e.target.value);
            setAboutBusinessError(""); // Clear error on change
          }}
          placeholder="Describe the business..."
          className={`min-h-[100px] mt-2 ${
            aboutBusinessError ? "border-red-500" : ""
          }`} // Add error class
        />
        {aboutBusinessError && (
          <p className="text-red-500 text-sm mt-1">{aboutBusinessError}</p>
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
                className="absolute top-1 right-[-5] z-2 h-6 w-6  transition-opacity p-1 bg-gray-100 hover:bg-gray-200" // Adjusted padding
                onClick={() => handleImageDelete(image.$id)}
                aria-label="Delete image"
                // disabled={!createdBusinessId}
              >
                <X className="h-4 w-4" /> {/* Changed icon to Trash2 */}
              </Button>
              <Image
                src={image.imageUrl}
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
            {/* Slightly larger Plus icon */}
            <Plus className="h-15 w-15 text-muted-foreground border border-input bg-gray-100 hover:bg-gray-200 rounded-full p-[5%]" />
            <span className="sr-only">Add photo/video</span>{" "}
            {/* Keep sr-only for accessibility */}
            <Input
              id="imageUpload"
              type="file"
              multiple
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
      <div className="flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-grow">
          <Label htmlFor="addressLine1" className="font-semibold">
            <span className="text-destructive">*</span> Business Address Line 1
          </Label>
          <Input
            id="addressLine1"
            value={addressLine1}
            required
            onChange={(e) => {
              setAddressLine1(e.target.value);
              setAddressLine1Error(""); // Clear error on change
            }}
            placeholder="Enter address line 1"
            className={`mt-2 ${addressLine1Error ? "border-red-500" : ""}`} // Add error class
          />
          {addressLine1Error && (
            <p className="text-red-500 text-sm mt-1">{addressLine1Error}</p>
          )}
        </div>
        <div className="">
          <Label htmlFor="city" className="font-semibold">
            <span className="text-destructive">*</span> City
          </Label>
          <Select
            value={city}
            onValueChange={(value) => {
              setCity(value);
              setCityError(""); // Clear error on change
            }}
            required
          >
            <SelectTrigger
              id="city"
              className={`mt-2 ${cityError ? "border-red-500" : ""}`} // Add error class
            >
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
          {cityError && (
            <p className="text-red-500 text-sm mt-1">{cityError}</p>
          )}
        </div>
        <div className="">
          <Label htmlFor="country" className="font-semibold">
            <span className="text-destructive">*</span> Country
          </Label>
          <Select
            value={country}
            onValueChange={(value) => {
              setCountry(value);
              setCountryError(""); // Clear error on change
            }}
            required
          >
            <SelectTrigger
              id="country"
              className={`mt-2 ${countryError ? "border-red-500" : ""}`} // Add error class
            >
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
          {countryError && (
            <p className="text-red-500 text-sm mt-1">{countryError}</p>
          )}
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

      {/* Business Email & Website */}
      <div className="flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-grow">
          <Label htmlFor="businessEmail" className="font-semibold">
            Business Email
          </Label>
          <Input
            id="businessEmail"
            type="email"
            value={businessEmail}
            onChange={(e) => setBusinessEmail(e.target.value)}
            placeholder="Enter business email"
            className="mt-2"
          />
        </div>
        <div className="flex-grow">
          <Label htmlFor="businessWebsite" className="font-semibold">
            Business Website
          </Label>
          <Input
            id="businessWebsite"
            type="url"
            value={businessWebsite}
            onChange={(e) => handleBusinessWebsite(e.target.value)}
            placeholder="https://example.com"
            className="mt-2"
          />
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
              if (e.key === "Enter") {
                e.preventDefault(); // Prevent potential form submission
                handleAddService();
              }
            }}
          />
          <Button
            onClick={handleAddService}
            type="button"
            className="bg-[#2E57A9]"
          >
            {" "}
            {/* Use type="button" to prevent form submission */}
            Add Service
          </Button>
        </div>
        {/* Display existing services */}
        <div className="flex flex-wrap gap-2">
          {servicesOffered.map((service) => (
            <Badge
              key={service}
              variant="secondary"
              className="py-1 px-2 text-sm text-white bg-[#2E57A9]"
            >
              {service}
              <button
                onClick={() => handleRemoveService(service)}
                className="ml-1.5 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label={`Remove ${service}`}
              >
                <X className="h-3 w-3 text-white hover:text-foreground" />
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
              className="data-[state=checked]:bg-[#2E57A9]"
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
              className="data-[state=checked]:bg-[#2E57A9]"
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
                  value={availableHours[day].open}
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
                  value={availableHours[day].close}
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
                  className="h-5 w-5 data-[state=checked]:bg-[#2E57A9]"
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

      {/* Terms and Conditions Checkbox */}
      <div className="flex items-center space-x-2 pt-4">
        <Checkbox
          id="terms"
          checked={agreedToTerms}
          onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
          className="data-[state=checked]:bg-[#2E57A9]"
          required
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
      </div>
      {termsError && <p className="text-red-500 text-sm mt-1">{termsError}</p>}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="rounded-full"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={createBusiness.status === "pending" || !isFormValid()} // Disable if form is invalid or creating
          className="rounded-full bg-[#2E57A9]"
        >
          {createBusiness.status === "pending" ? "Creating..." : "Create"}
        </Button>
      </div>
    </div>
  );
}
