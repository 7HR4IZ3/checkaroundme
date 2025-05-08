"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import Image from "next/image";
import { toast } from "sonner";
import { Country, State, City } from "country-state-city";

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
import { Business, BusinessImage } from "@/lib/schema";
import { LoadingSVG } from "@/components/ui/loading";
import { VerificationUpload } from "@/components/business/verification-upload"; // Changed to named import

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

export default function BusinessForm({
  initialData,
  businessId,
  onSubmit,
  submitButtonText,
  isSubmitting,
}: BusinessFormProps) {
  const { user } = useAuth();

  // --- State Hooks ---
  const [businessName, setBusinessName] = useState("");
  const [aboutBusiness, setAboutBusiness] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState(""); // Added state for selected state
  const [newService, setNewService] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+234");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [servicesOffered, setServicesOffered] = useState<string[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isImageDeleting, setIsImageDeleting] = useState<string[]>([]);

  // State for country, state, and city data
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const [businessEmail, setBusinessEmail] = useState("");
  const [businessWebsite, setBusinessWebsite] = useState("https://");
  const [paymentOptions, setPaymentOptions] = useState<{
    [key: string]: boolean;
  }>({
    cash: true,
    bank_transfers: true, // Match schema key
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

  const [businessImages, setBusinessImages] = useState<BusinessImage[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false); // Added state for terms agreement

  // State for new filterable attributes
  const [priceIndicator, setPriceIndicator] = useState<string | undefined>(
    undefined,
  );
  const [onSiteParking, setOnSiteParking] = useState(false);
  const [garageParking, setGarageParking] = useState(false);
  const [wifi, setWifi] = useState(false);

  // --- Error State Hooks (can be passed down or managed here) ---
  const [businessNameError, setBusinessNameError] = useState("");
  const [aboutBusinessError, setAboutBusinessError] = useState("");
  const [addressLine1Error, setAddressLine1Error] = useState("");
  const [cityError, setCityError] = useState("");
  const [countryError, setCountryError] = useState("");
  const [termsError, setTermsError] = useState("");

  // --- tRPC queries ---
  const { data: businessCategories } = trpc.getAllCategories.useQuery();
  const { data: tempBusinessImages, isLoading: isLoadingTempImages } =
    trpc.getBusinessImages.useQuery(
      { businessId: user?.$id! },
      { enabled: !businessId && !!user?.$id },
    ); // Fetch temp images only in create mode
  const deleteBusinessImage = trpc.deleteBusinessImage.useMutation();

  // --- Populate form state when initialData loads (for edit mode) ---
  useEffect(() => {
    if (initialData) {
      setBusinessName(initialData.name ?? "");
      setAboutBusiness(initialData.about ?? "");
      setAddressLine1(initialData.addressLine1 ?? "");
      setAddressLine2(initialData.addressLine2 ?? "");
      setPhoneNumber(initialData.phone ?? "");
      setBusinessCategory(initialData.categories?.[0] ?? "");
      setServicesOffered(initialData.services ?? []);
      setPaymentOptions({
        cash: initialData.paymentOptions?.includes("cash") ?? false,
        bank_transfers:
          initialData.paymentOptions?.includes("bank_transfers") ?? false, // Match schema key
      });
      setBusinessEmail(initialData.email ?? "");
      setBusinessWebsite(initialData.website ?? "");
      setCity(initialData.city ?? "");
      setCountry(initialData.country ?? "");
      setState(initialData.state ?? ""); // Populate state from initial data

      // Populate new filterable attributes
      setPriceIndicator(initialData.priceIndicator ?? undefined);
      setOnSiteParking(initialData.onSiteParking ?? false);
      setGarageParking(initialData.garageParking ?? false);
      setWifi(initialData.wifi ?? false);

      // Assuming initialData includes images and hours for edit mode
      if (initialData.images) {
        setBusinessImages(initialData.images);
      }
      if (initialData.hours) {
        const formattedHours: any = {};
        for (const hour of initialData.hours) {
          formattedHours[hour.day] = {
            open: hour.openTime ?? "",
            close: hour.closeTime ?? "",
            closed: hour.isClosed ?? false,
          };
        }
        setAvailableHours(formattedHours);
      }
    }
  }, [initialData]);

  // Populate temp images in create mode
  useEffect(() => {
    if (!businessId && !isLoadingTempImages && tempBusinessImages) {
      setBusinessImages(tempBusinessImages);
    }
  }, [businessId, isLoadingTempImages, tempBusinessImages]);

  // Fetch countries on component mount
  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (country) {
      const selectedCountry = Country.getAllCountries().find(
        (c) => c.name === country,
      );
      if (selectedCountry) {
        setStates(State.getStatesOfCountry(selectedCountry.isoCode));
        setCities([]); // Clear cities when country changes
        setCity(""); // Clear selected city when country changes
      }
    } else {
      setStates([]);
      setCities([]);
      setCity("");
      setState(""); // Clear selected state when country changes
    }
  }, [country]);

  // Fetch cities when state changes
  useEffect(() => {
    if (country && state) {
      const selectedCountry = Country.getAllCountries().find(
        (c) => c.name === country,
      );
      if (selectedCountry) {
        const selectedState = State.getStatesOfCountry(
          selectedCountry.isoCode,
        ).find((s) => s.name === state);
        if (selectedState) {
          setCities(
            City.getCitiesOfState(
              selectedCountry.isoCode,
              selectedState.isoCode,
            ),
          );
          setCity(""); // Clear selected city when state changes
        }
      }
    } else {
      setCities([]);
      setCity("");
    }
  }, [country, state]);

  const updateBusinessHours = (
    day: string,
    type: "start" | "end" | "closed",
    value: string | boolean,
  ) => {
    setAvailableHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value,
      },
    }));
  };

  // --- Handlers ---
  const handleBusinessWebsite = (value: string) => {
    if (!value.startsWith("https://")) {
      setBusinessWebsite("https://" + value);
    } else {
      setBusinessWebsite(value);
    }
  };

  const handleImageDelete = async (idToDelete: string) => {
    try {
      setIsImageDeleting((prev) => [...prev, idToDelete]);
      await deleteBusinessImage.mutateAsync({ imageId: idToDelete });
      setBusinessImages((prev) => prev.filter((img) => img.$id !== idToDelete));
      setIsImageDeleting((prev) => prev.filter((id) => id !== idToDelete));
    } catch (err) {
      console.error("Failed to delete image", err);
      toast("Error", { description: "Failed to delete image" });
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
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
      servicesOffered.filter((service) => service !== serviceToRemove),
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
    // Basic validation for required fields
    const isValid =
      businessName.trim() !== "" &&
      aboutBusiness.trim() !== "" &&
      addressLine1.trim() !== "" &&
      city.trim() !== "" &&
      country.trim() !== "";

    // Additional validation for create mode (terms agreement)
    if (!businessId) {
      // Only require terms in create mode
      return isValid && agreedToTerms;
    }

    return isValid; // No terms required in edit mode
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setBusinessNameError("");
    setAboutBusinessError("");
    setAddressLine1Error("");
    setCityError("");
    setCountryError("");
    setTermsError("");

    if (!isFormValid()) {
      console.error(
        "Form is not valid. Please fill all required fields and agree to the terms.",
      );
      if (!businessId && !agreedToTerms) {
        // Only set terms error in create mode
        setTermsError("Please accept the terms and conditions.");
      }
      return;
    }

    const formData = {
      name: businessName,
      about: aboutBusiness,
      addressLine1,
      addressLine2,
      city,
      country,
      phone: phoneCountryCode + phoneNumber, // TODO: Sanitize this
      categories: businessCategory ? [businessCategory] : [],
      services: servicesOffered,
      paymentOptions: Object.keys(paymentOptions).filter(
        (key) => paymentOptions[key],
      ),
      hours: availableHours,
      images: businessImages.map(({ isPrimary, $id }) => ({
        isPrimary,
        imageID: $id,
      })),
      email: businessEmail,
      website: businessWebsite,
      // Add new filterable attributes
      priceIndicator: priceIndicator,
      on_site_parking: onSiteParking,
      garage_parking: garageParking,
      wifi: wifi,
    };

    await onSubmit(formData);
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-8 lg:px-16 space-y-8">
      <div className="flex justify-between items-start">
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
            className={`mt-1 ${businessNameError ? "border-red-500" : ""}`}
          />
          {businessNameError && (
            <p className="text-red-500 text-sm mt-1">{businessNameError}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Input full name, ensure there are no special characters
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {businessId && ( // Show disable button only in edit mode
            <Button variant="destructive" className="rounded-4xl">
              Disable Business
            </Button>
          )}
          <Button
            className="rounded-4xl bg-[#2E57A9]"
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid()}
          >
            {isSubmitting ? "Saving..." : submitButtonText}
          </Button>
          {businessId && ( // Show more options only in edit mode
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
              <DialogContent className="sm:max-w-[425px]">
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
          value={aboutBusiness}
          required
          onChange={(e) => {
            setAboutBusiness(e.target.value);
            setAboutBusinessError(""); // Clear error on change
          }}
          placeholder="Describe the business..."
          className={`min-h-[100px] mt-2 ${
            aboutBusinessError ? "border-red-500" : ""
          }`}
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
                className="absolute top-1 right-[-5] z-2 h-6 w-6  transition-opacity p-1 bg-gray-100 hover:bg-gray-200"
                onClick={() => handleImageDelete(image.$id)}
                aria-label="Delete image"
              >
                <X className="h-4 w-4" />
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
      </div>

      {/* Business Address */}
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
            className={`mt-2 ${addressLine1Error ? "border-red-500" : ""}`}
          />
          {addressLine1Error && (
            <p className="text-red-500 text-sm mt-1">{addressLine1Error}</p>
          )}
        </div>
        <div className="flex-grow">
          <Label htmlFor="country" className="font-semibold">
            <span className="text-destructive">*</span> Country
          </Label>
          <Select
            value={country}
            onValueChange={(value) => {
              setCountry(value);
              setCountryError("");

              const country = countries.find(
                (country) => country.name === value,
              );
              country && setPhoneCountryCode(country.phoneCode);
            }}
            required
          >
            <SelectTrigger
              id="country"
              className={`mt-2 ${countryError ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.isoCode} value={country.name}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {countryError && (
            <p className="text-red-500 text-sm mt-1">{countryError}</p>
          )}
        </div>
        <div className="flex-grow">
          <Label htmlFor="state" className="font-semibold">
            <span className="text-destructive">*</span> State
          </Label>
          <Select
            value={state}
            onValueChange={(value) => {
              setState(value);
              // No state error state needed as city error covers it
            }}
            required
            disabled={!country} // Disable state select if no country is selected
          >
            <SelectTrigger
              id="state"
              className={`mt-2 ${cityError ? "border-red-500" : ""}`} // Use cityError for state as well for simplicity
            >
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state.isoCode} value={state.name}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-grow">
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
            disabled={!state} // Disable city select if no state is selected
          >
            <SelectTrigger
              id="city"
              className={`mt-2 ${cityError ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.name} value={city.name}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {cityError && (
            <p className="text-red-500 text-sm mt-1">{cityError}</p>
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
              onValueChange={(country) => {
                setPhoneCountryCode(countries.find(c => c.name === country)?.phonecode)
              }}
            >
              <SelectTrigger id="phoneCountryCode" className="w-24">
                <SelectValue placeholder="Code" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(country => country.name)
                  .sort()
                  .map((country) => (
                    <SelectItem value={country}>
                      {country}
                    </SelectItem>
                  ))}
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

      {/* Price Indicator */}
      <div className="md:w-1/2">
        <Label htmlFor="priceIndicator" className="font-semibold">
          Price Indicator
        </Label>
        <p className="text-sm text-muted-foreground mb-2">
          Select the typical maximum price range for your main
          services/products.
        </p>
        <Select value={priceIndicator} onValueChange={setPriceIndicator}>
          <SelectTrigger id="priceIndicator" className="w-full mt-2">
            <SelectValue placeholder="Select maximum price range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="$10">$10</SelectItem>
            <SelectItem value="$100">$100</SelectItem>
            <SelectItem value="$1,000">$1,000</SelectItem>
            <SelectItem value="$10,000">$10,000</SelectItem>
          </SelectContent>
        </Select>
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
              className="data-[state=checked]:bg-[#2E57A9]"
              checked={onSiteParking}
              onCheckedChange={(checked) =>
                setOnSiteParking(checked as boolean)
              }
            />
            <Label htmlFor="onSiteParking">On-Site Parking</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="garageParking"
              className="data-[state=checked]:bg-[#2E57A9]"
              checked={garageParking}
              onCheckedChange={(checked) =>
                setGarageParking(checked as boolean)
              }
            />
            <Label htmlFor="garageParking">Garage Parking</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="wifi"
              className="data-[state=checked]:bg-[#2E57A9]"
              checked={wifi}
              onCheckedChange={(checked) => setWifi(checked as boolean)}
            />
            <Label htmlFor="wifi">Wifi Available</Label>
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

      {/* Terms and Conditions Checkbox (only in create mode) */}
      {!businessId && (
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
      )}
      {termsError && <p className="text-red-500 text-sm mt-1">{termsError}</p>}

      {/* Cancel Button */}
      <div className="flex justify-end gap-4 pt-4">
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
