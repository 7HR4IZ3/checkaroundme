import React, { useState, useCallback, useMemo } from "react";
import { FaSlidersH, FaChevronDown, FaChevronRight } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { LocationHierarchy } from "@/utils/location-helpers";
import { Country, State } from "country-state-city";

type FilterSortBarProps = {
  selectedCategories: string[]; // For filters like "offers_delivery"
  onChangeCategories: (categories: string[]) => void;
  onOpenFiltersPanel: () => void;
  locations: string[];
  selectedLocation: string | null;
  onChangeLocation: (location: string | null) => void;
  openNow: boolean;
  onToggleOpenNow: () => void;
  selectedDistance: string | null; // e.g., "1km", "5km", "any"
  onChangeDistance: (distance: string | null) => void;
  sortBy: string; // e.g., "rating", "distance", "price_asc"
  onSortByChange: (sortValue: string) => void;
  locationsHierarchy: LocationHierarchy;
};

const OTHER_FILTER_CATEGORIES = [
  { label: "Offers Delivery", value: "offers_delivery" },
];

const DISTANCE_OPTIONS = [
  { label: "Any Distance", value: "any" },
  { label: "Within 1 km", value: "1km" },
  { label: "Within 5 km", value: "5km" },
  { label: "Within 10 km", value: "10km" },
  { label: "Within 25 km", value: "25km" },
  { label: "Within 50 km", value: "50km" },
  { label: "Within 100 km", value: "100km" },
  { label: "Within 200 km", value: "200km" },
  { label: "Within 300 km", value: "300km" },
  { label: "Within 400 km", value: "400km" },
  { label: "Within 500 km", value: "500km" },
];

const SORT_OPTIONS = [
  { label: "Top Picks", value: "top" },
  { label: "Rating", value: "rating" },
  { label: "Distance", value: "distance" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

// Memoized location menu items
const LocationMenuItem = React.memo(
  ({
    label,
    onClick,
    indent = 0,
    hasChildren = false,
  }: {
    label: string;
    onClick: () => void;
    indent?: number;
    hasChildren?: boolean;
  }) => (
    <DropdownMenuItem
      className={`flex items-center justify-between ${
        indent ? `pl-${indent * 4}` : ""
      }`}
      onClick={onClick}
    >
      <span>{label}</span>
      {hasChildren && <FaChevronRight size={12} />}
    </DropdownMenuItem>
  )
);

LocationMenuItem.displayName = "LocationMenuItem";

const FilterSortBar: React.FC<FilterSortBarProps> = ({
  selectedCategories,
  onChangeCategories,
  onOpenFiltersPanel,
  locations,
  selectedLocation,
  onChangeLocation,
  openNow,
  onToggleOpenNow,
  selectedDistance,
  onChangeDistance,
  sortBy,
  onSortByChange,
  locationsHierarchy,
}) => {
  const handleOtherCategoryClick = (value: string) => {
    const isSelected = selectedCategories.includes(value);
    if (isSelected) {
      onChangeCategories(selectedCategories.filter((cat) => cat !== value));
    } else {
      onChangeCategories([...selectedCategories, value]);
    }
  };

  const handlePriceSortClick = (sortValue: string) => {
    onSortByChange(sortValue);
  };

  // Memoize location selection handlers
  const handleLocationChange = useCallback(
    (country: string | null, state?: string, city?: string) => {
      if (city && state && country) {
        onChangeLocation(`${city}, ${state}, ${country}`);
      } else if (state && country) {
        onChangeLocation(`${state}, ${country}`);
      } else if (country) {
        onChangeLocation(country);
      } else {
        onChangeLocation(null);
      }
    },
    [onChangeLocation]
  );

  const handleResetLocation = useCallback(() => {
    onChangeLocation(null);
  }, [onChangeLocation]);

  // Memoize location dropdown content
  const locationDropdownContent = useMemo(
    () => (
      <DropdownMenuContent className="w-[280px] max-h-[400px] overflow-y-auto">
        <div className="p-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={handleResetLocation}
          >
            Reset Location
          </Button>
        </div>
        <LocationMenuItem
          label="All Locations"
          onClick={() => handleLocationChange(null)}
        />
        {Object.entries(locationsHierarchy).map(
          ([country, { name, states }]) => (
            <div key={country} className="group">
              <LocationMenuItem
                label={name}
                onClick={() => handleLocationChange(country)}
                hasChildren={Object.keys(states).length > 0}
                indent={0}
              />
              {Object.entries(states).map(
                ([state, { name: stateName, cities }]) => (
                  <div key={state}>
                    <LocationMenuItem
                      label={stateName}
                      onClick={() => handleLocationChange(country, state)}
                      hasChildren={cities.length > 0}
                      indent={1}
                    />
                    {cities.map((city) => (
                      <LocationMenuItem
                        key={city}
                        label={city}
                        onClick={() =>
                          handleLocationChange(country, state, city)
                        }
                        indent={2}
                      />
                    ))}
                  </div>
                )
              )}
            </div>
          )
        )}
      </DropdownMenuContent>
    ),
    [locationsHierarchy, handleLocationChange, handleResetLocation]
  );

  // Memoize selected location display
  const selectedLocationDisplay = useMemo(() => {
    if (!selectedLocation) return "All Locations";
    const parts = selectedLocation.split(", ");
    return parts[0]; // Show only the most specific part (city or state or country)
  }, [selectedLocation]);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-xs"
          onClick={onOpenFiltersPanel}
        >
          <FaSlidersH className="mr-2" size={12} />
          All Filters
        </Button>
        <Button
          variant={openNow ? "default" : "outline"}
          size="sm"
          className="rounded-full text-xs"
          onClick={onToggleOpenNow}
        >
          Open Now
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
            >
              {DISTANCE_OPTIONS.find(
                (d: { value: string; label: string }) =>
                  d.value === (selectedDistance || "any")
              )?.label || "Distance"}
              <FaChevronDown className="ml-1" size={12} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {DISTANCE_OPTIONS.map(
              (option: { value: string; label: string }) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() =>
                    onChangeDistance(
                      option.value === "any" ? null : option.value
                    )
                  }
                >
                  {option.label}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {OTHER_FILTER_CATEGORIES.map(
          (cat: { value: string; label: string }) => (
            <Button
              key={cat.value}
              variant={
                selectedCategories.includes(cat.value) ? "default" : "outline"
              }
              size="sm"
              className="rounded-full text-xs"
              onClick={() => handleOtherCategoryClick(cat.value)}
            >
              {cat.label}
            </Button>
          )
        )}
      </div>
      <div className="flex flex-row items-center gap-2 text-xs md:text-sm">
        <span className="text-xs md:text-sm text-gray-600 hidden md:block">
          Location:
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-[180px] justify-between"
            >
              {selectedLocationDisplay}
              <FaChevronDown className="ml-2" size={12} />
            </Button>
          </DropdownMenuTrigger>
          {locationDropdownContent}
        </DropdownMenu>
        <span className="text-xs md:text-sm text-gray-600 mx-2 hidden md:block">
          Sort:
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs">
              {SORT_OPTIONS.find(
                (opt: { value: string; label: string }) => opt.value === sortBy
              )?.label || "Sort By"}
              <FaChevronDown className="ml-1" size={12} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            {SORT_OPTIONS.map((option: { value: string; label: string }) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handlePriceSortClick(option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

// Memoize the entire component
export default React.memo(FilterSortBar);
