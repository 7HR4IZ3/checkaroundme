import React, { useState } from "react";
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

  // This function is kept to resolve the error, though direct calls to onSortByChange are preferred
  const handlePriceSortClick = (sortValue: string) => {
    onSortByChange(sortValue);
  };

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // Add state for controlling dropdown menus
  const [isOpen, setIsOpen] = useState(false);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const [activeState, setActiveState] = useState<string | null>(null);

  // Modify the open states to include nesting
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<{
    country: string | null;
    state: string | null;
  }>({
    country: null,
    state: null,
  });

  const handleLocationChange = (
    country: string | null,
    state?: string,
    city?: string
  ) => {
    setSelectedCountry(country);
    setSelectedState(state || null);
    setSelectedCity(city || null);

    // Close all dropdowns
    setIsLocationOpen(false);
    setOpenMenus({ country: null, state: null });

    if (city && state && country) {
      onChangeLocation(`${city}, ${state}, ${country}`);
    } else if (state && country) {
      onChangeLocation(`${state}, ${country}`);
    } else if (country) {
      onChangeLocation(country);
    } else {
      onChangeLocation(null);
    }
  };

  // Replace the handleCountryClick and handleStateClick with these
  const handleCountryClick = (countryCode: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenMenus((prev) => ({
      country: prev.country === countryCode ? null : countryCode,
      state: null,
    }));
  };

  const handleStateClick = (stateCode: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenMenus((prev) => ({
      ...prev,
      state: prev.state === stateCode ? null : stateCode,
    }));
  };

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
        <DropdownMenu open={isLocationOpen} onOpenChange={setIsLocationOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-[180px] justify-between"
            >
              {selectedCity
                ? selectedCity
                : selectedState
                ? (selectedCountry
                    ? State.getStateByCodeAndCountry(
                        selectedState,
                        selectedCountry
                      )
                    : State.getStateByCode(selectedState)
                  )?.name
                : selectedCountry
                ? Country.getCountryByCode(selectedCountry)?.name
                : "All Locations"}
              <FaChevronDown className="ml-2" size={12} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[220px] max-h-[400px] overflow-y-auto">
            <DropdownMenuItem onClick={() => handleLocationChange(null)}>
              All Locations
            </DropdownMenuItem>
            {Object.entries(locationsHierarchy).map(
              ([country, { name, states }]) => (
                <DropdownMenu
                  key={country}
                  open={openMenus.country === country}
                  onOpenChange={(open) => {
                    setOpenMenus((prev) => ({
                      country: open ? country : null,
                      state: null,
                    }));
                  }}
                >
                  <DropdownMenuTrigger
                    className="w-full px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-default flex items-center justify-between"
                    onClick={(event) => handleCountryClick(country, event)}
                  >
                    {name}
                    <FaChevronRight size={12} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" className="w-[220px]">
                    <DropdownMenuItem
                      onClick={() => handleLocationChange(country)}
                    >
                      All in {name}
                    </DropdownMenuItem>
                    {Object.entries(states).map(
                      ([state, { name: stateName, cities }]) => (
                        <DropdownMenu
                          key={state}
                          open={openMenus.state === state}
                          onOpenChange={(open) => {
                            setOpenMenus((prev) => ({
                              ...prev,
                              state: open ? state : null,
                            }));
                          }}
                        >
                          <DropdownMenuTrigger
                            className="w-full px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-default flex items-center justify-between"
                            onClick={(event) => handleStateClick(state, event)}
                          >
                            {stateName}
                            <FaChevronRight size={12} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            side="right"
                            className="w-[220px]"
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                handleLocationChange(country, state)
                              }
                            >
                              All in {stateName}
                            </DropdownMenuItem>
                            {cities.map((city) => (
                              <DropdownMenuItem
                                key={city}
                                onClick={() =>
                                  handleLocationChange(country, state, city)
                                }
                              >
                                {city}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            )}
          </DropdownMenuContent>
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

export default FilterSortBar;
