// src/components/BusinessEditForm.tsx
"use client";

import { useState } from "react";
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

const initialImages: BusinessImage[] = [
  { id: "1", url: "/placeholder-mechanic-1.jpg", alt: "Mechanic working on engine" },
  { id: "2", url: "/placeholder-mechanic-2.jpg", alt: "Car on lift" },
  { id: "3", url: "/placeholder-mechanic-3.jpg", alt: "Workshop interior" },
  { id: "4", url: "/placeholder-mechanic-4.jpg", alt: "Tools and parts" },
];

const initialServices = [
    "Bumper repair", "Auto frame testing", "Auto wheel alignment",
    "Auto steering and suspension repair", "Routine automotive maintenance",
    "Dent removal", "Auto maintenance", "Auto repairs",
    "Auto wheel and tire repair", "Rear-end damage"
];

// Mock available hours structure
const availableHours = [
    { day: "Mon", hours: "9:00 AM - 6:00 PM" },
    { day: "Tue", hours: "9:00 AM - 6:00 PM" },
    { day: "Wed", hours: "9:00 AM - 6:00 PM" },
    { day: "Thu", hours: "9:00 AM - 6:00 PM" },
    { day: "Fri", hours: "9:00 AM - 6:00 PM" },
    { day: "Sat", hours: "9:00 AM - 6:00 PM" },
    { day: "Sun", hours: "Closed" },
];

export default function BusinessEditForm() {
  // --- State Hooks ---
  const [businessName, setBusinessName] = useState("Mobile Mercedes Mechanic");
  const [aboutBusiness, setAboutBusiness] = useState(
    "wheel alignment wheel balancing tyres tyre repairs tyre fitting car accident repairs car spraying dent removal car scratch repairs car restoration bumper repairs alloy wheel repairs alloy wheel refurbishment car diagnostics commercial vehicle repairs welding"
  );
  const [businessImages, setBusinessImages] = useState<BusinessImage[]>(initialImages);
  const [businessAddress, setBusinessAddress] = useState("10 Greenshield Industrial Estate Bradfield Road Lagos");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+234"); // Design shows fixed +234
  const [phoneNumber, setPhoneNumber] = useState("08123456789"); // Placeholder
  const [businessCategory, setBusinessCategory] = useState("auto-mechanics");
  const [servicesOffered, setServicesOffered] = useState<string[]>(initialServices);
  // Add state for adding new service if needed
  // const [newService, setNewService] = useState("");

  // --- Handlers (Basic Placeholders) ---
  const handleImageDelete = (idToDelete: string) => {
    setBusinessImages(businessImages.filter(img => img.id !== idToDelete));
    console.log("Delete image:", idToDelete);
    // Add API call logic here
  };

   const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Simulate adding an image preview
      const newImage: BusinessImage = {
        id: Date.now().toString(), // simple unique id
        url: URL.createObjectURL(files[0]), // Create temporary URL for preview
        alt: files[0].name,
      };
      setBusinessImages([...businessImages, newImage]);
      console.log("Uploaded file:", files[0].name);
      // Add actual upload logic here
    }
   };

  const handleRemoveService = (serviceToRemove: string) => {
    setServicesOffered(servicesOffered.filter(service => service !== serviceToRemove));
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

  const handleSave = () => {
    console.log("Saving data:", {
        businessName,
        aboutBusiness,
        businessImages, // You'd likely send identifiers or new file data
        businessAddress,
        phoneCountryCode,
        phoneNumber,
        businessCategory,
        servicesOffered,
        // hours data if editable
    });
    // Add API call logic here
  };


  return (
    <div className="max-w-4xl mx-auto p-6 border rounded-lg shadow-sm bg-card text-card-foreground space-y-6">

      {/* Business Name */}
      <div>
        <Label htmlFor="businessName" className="font-semibold">
          <span className="text-destructive">*</span> Name of Business
        </Label>
        <p className="text-sm text-muted-foreground mb-2">Input name of the business below</p>
        <Input
          id="businessName"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Enter business name"
        />
         <p className="text-xs text-muted-foreground mt-1">Input full name, ensure there are no special characters</p>
      </div>

      {/* About the Business */}
      <div>
        <Label htmlFor="aboutBusiness" className="font-semibold">About the Business</Label>
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
        <Label className="font-semibold block mb-2">Business photo/videos</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {businessImages.map((image) => (
            <Card key={image.id} className="relative group aspect-square overflow-hidden">
              <Image
                src={image.url}
                alt={image.alt}
                fill // Use fill to cover the card area
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw" // Optimize image loading
                style={{ objectFit: 'cover' }} // Ensure image covers the area
                priority={initialImages.some(img => img.id === image.id)} // Prioritize initial images
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
            className="flex items-center justify-center aspect-square border-2 border-dashed border-muted-foreground rounded-lg cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
           >
             <Plus className="h-10 w-10 text-muted-foreground" />
             <span className="sr-only">Add photo/video</span>
             <Input
               id="imageUpload"
               type="file"
               className="sr-only" // Hide the default input
               accept="image/*, video/*" // Accept images and videos
               onChange={handleImageUpload}
             />
           </Label>
        </div>
      </div>

      {/* Business Address */}
      <div>
        <Label htmlFor="businessAddress" className="font-semibold">Business Address</Label>
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
        <Label htmlFor="phoneNumber" className="font-semibold">Phone number</Label>
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
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
            className="flex-1"
            aria-label="Phone number"
          />
        </div>
      </div>

      {/* Business Category */}
       <div>
        <Label htmlFor="businessCategory" className="font-semibold">Business Category</Label>
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
                <Badge key={service} variant="secondary" className="py-1 px-2 text-sm">
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
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
       </div>
    </div>
  );
}