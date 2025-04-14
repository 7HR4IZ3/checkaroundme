// src/components/FiltersPanel.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Define types for filter options for better structure
interface CheckboxOption {
  id: string;
  label: string;
}

const featureOptions: CheckboxOption[] = [
  { id: "open_now", label: "Open Right Now" },
  { id: "on_site_parking", label: "On-Site Parking" },
  { id: "garage_parking", label: "Garage Parking" },
  { id: "wifi", label: "Wifi" },
  { id: "bank_transfers", label: "Accepts Bank Transfers" },
  { id: "cash", label: "Accepts Cash" },
];

const distanceOptions: CheckboxOption[] = [
  { id: "birds_eye", label: "Bird's Eye View" },
  { id: "within_2km", label: "Within 2km" },
  { id: "within_5km", label: "Within 5km" },
  { id: "within_6km", label: "Within 6km" }, // Added 6km as it's in the design
  { id: "within_10km", label: "Within 10km" },
  { id: "across_city", label: "Across the City" },
];

export function FiltersPanel() {
  // State for selected filters
  const [selectedPrice, setSelectedPrice] = useState<string | undefined>(undefined); // Store the value like "$", "$$", etc.

  // Using an object to store checkbox states is often easier to manage
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, boolean>>({
      open_now: true, // Pre-selected based on design
      // Initialize others as false
      on_site_parking: false,
      garage_parking: false,
      wifi: false,
      bank_transfers: false,
      cash: false,
  });

  const [selectedDistances, setSelectedDistances] = useState<Record<string, boolean>>({
      birds_eye: true, // Pre-selected based on design
      // Initialize others as false
      within_2km: false,
      within_5km: false,
      within_6km: false,
      within_10km: false,
      across_city: false,
  });

  // Handlers for updating state
  const handleFeatureChange = (featureId: string, checked: boolean | 'indeterminate') => {
    if (typeof checked === 'boolean') {
        setSelectedFeatures(prev => ({ ...prev, [featureId]: checked }));
    }
  };

  const handleDistanceChange = (distanceId: string, checked: boolean | 'indeterminate') => {
     if (typeof checked === 'boolean') {
        setSelectedDistances(prev => ({ ...prev, [distanceId]: checked }));
    }
  };

  const handleGoBack = () => {
    console.log("Go Back clicked");
    // Add navigation or state reset logic
  };

  const handleConfirm = () => {
    console.log("Confirm clicked. Filters:", {
      price: selectedPrice,
      features: Object.keys(selectedFeatures).filter(key => selectedFeatures[key]), // Get array of selected feature IDs
      distances: Object.keys(selectedDistances).filter(key => selectedDistances[key]), // Get array of selected distance IDs
    });
    // Add logic to apply filters / close panel etc.
  };


  return (
    <div className="sticky top-[88px] z-30 w-full max-w-xs p-6 space-y-6 border rounded-lg bg-card text-card-foreground shadow-md"> {/* Adjust max-w as needed */}
      <h2 className="text-xl font-semibold">Filters</h2>

      {/* Price Section */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Price</Label>
        <ToggleGroup
          type="single" // Only one price can be selected
          value={selectedPrice}
          onValueChange={(value) => {
            // If the user clicks the currently selected value, it returns "", deselecting it.
            // We store undefined if empty or the actual value.
            setSelectedPrice(value || undefined);
          }}
          className="flex border rounded-md overflow-hidden" // Group styling
        >
          {["$", "$$", "$$$", "$$$$"].map((price) => (
            <ToggleGroupItem
              key={price}
              value={price}
              aria-label={`Price range ${price}`}
              className="flex-1 rounded-none data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border-r last:border-r-0" // Style selected state & borders
            >
              {price}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Features Section */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Features</Label>
        <div className="space-y-3">
            {featureOptions.map((feature) => (
                <div key={feature.id} className="flex items-center space-x-2">
                    <Checkbox
                        id={`feature-${feature.id}`}
                        checked={selectedFeatures[feature.id]}
                        onCheckedChange={(checked) => handleFeatureChange(feature.id, checked)}
                    />
                    <Label
                        htmlFor={`feature-${feature.id}`}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        {feature.label}
                    </Label>
                </div>
            ))}
        </div>
      </div>

      {/* Distance Section */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Distance</Label>
         <div className="space-y-3">
            {distanceOptions.map((distance) => (
                <div key={distance.id} className="flex items-center space-x-2">
                    <Checkbox
                        id={`distance-${distance.id}`}
                        checked={selectedDistances[distance.id]}
                        onCheckedChange={(checked) => handleDistanceChange(distance.id, checked)}
                    />
                    <Label
                        htmlFor={`distance-${distance.id}`}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        {distance.label}
                    </Label>
                </div>
            ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4 pt-4">
         <Button
           variant="secondary" // Using secondary for the light grey look
           className="flex-1 bg-muted hover:bg-muted/80 text-muted-foreground" // More specific styling for the grey button
           onClick={handleGoBack}
        >
           Reset
         </Button>
         <Button
           className="flex-1" // Default primary button
           onClick={handleConfirm}
        >
           Apply
         </Button>
      </div>
    </div>
  );
}