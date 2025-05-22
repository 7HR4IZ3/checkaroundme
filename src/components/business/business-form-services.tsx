import React, { useCallback, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  UseFormRegister,
  FieldErrors,
  Control,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { BusinessFormValues } from "./business-form"; // Import the main form values type

interface BusinessFormServicesProps {
  // Pass RHF props down based on the main form values
  register: UseFormRegister<BusinessFormValues>;
  errors: FieldErrors<BusinessFormValues>;
  control: Control<BusinessFormValues>;
  setValue: UseFormSetValue<BusinessFormValues>;
  watch: UseFormWatch<BusinessFormValues>;
}

export const BusinessFormServices: React.FC<BusinessFormServicesProps> =
  React.memo(({ setValue, watch, errors }) => {
    const [newService, setNewService] = useState(""); // Keep local state for the input

    const servicesOffered = watch("services") ?? []; // Watch the services array from RHF

    const handleAddService = useCallback(() => {
      const trimmedService = newService.trim();
      if (trimmedService && !servicesOffered.includes(trimmedService)) {
        setValue("services", [...servicesOffered, trimmedService]); // Update RHF state
        setNewService(""); // Clear the input
      }
    }, [newService, servicesOffered, setValue]);

    const handleRemoveService = useCallback(
      (serviceToRemove: string) => {
        setValue(
          "services",
          servicesOffered.filter((service) => service !== serviceToRemove) // Update RHF state
        );
      },
      [servicesOffered, setValue]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Add service on Enter key press
        if (e.key === "Enter") {
          e.preventDefault(); // Prevent potential form submission
          handleAddService();
        }
      },
      [handleAddService]
    );

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">
          Services Offered
        </h3>
        <div>
          <Label className="font-semibold block mb-2">Add Services</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Add or remove services your business offers. Press Enter or click
            "Add Service".
          </p>
          {/* Input to add new service */}
          <div className="flex gap-2 mb-4">
            <Input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="Enter a service (e.g., Haircut)"
              className="flex-grow"
              onKeyDown={handleKeyDown}
            />
            <Button
              onClick={handleAddService}
              type="button"
              className="bg-primary"
            >
              Add Service
            </Button>
          </div>
          {/* Display existing services */}
          {servicesOffered.length > 0 && (
            <Label className="font-semibold block mb-2">Current Services</Label>
          )}
          <div className="flex flex-wrap gap-2">
            {servicesOffered.map((service) => (
              <Badge
                key={service}
                variant="secondary"
                className="py-1 px-2 text-sm text-white bg-primary"
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
        {errors.services && (
          <p className="text-red-500 text-sm mt-1">{errors.services.message}</p>
        )}
      </div>
    );
  });

BusinessFormServices.displayName = "BusinessFormServices";
