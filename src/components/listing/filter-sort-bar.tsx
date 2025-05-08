import React from "react";
import { FaSlidersH, FaChevronDown } from "react-icons/fa";
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
];

const SORT_OPTIONS = [
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
                  d.value === (selectedDistance || "any"),
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
                      option.value === "any" ? null : option.value,
                    )
                  }
                >
                  {option.label}
                </DropdownMenuItem>
              ),
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
          ),
        )}
      </div>
      <div className="flex flex-row items-center gap-2 text-xs md:text-sm">
        <span className="text-xs md:text-sm text-gray-600 hidden md:block">
          Location:
        </span>{" "}
        <Select
          value={selectedLocation || "all"}
          onValueChange={(newLocation) =>
            onChangeLocation(newLocation === "all" ? null : newLocation)
          }
        >
          <SelectTrigger className="w-[150px] md:w-[180px] text-xs">
            <SelectValue placeholder="Select Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((location: string) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs md:text-sm text-gray-600 mx-2 hidden md:block">
          Sort:
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs">
              {SORT_OPTIONS.find(
                (opt: { value: string; label: string }) => opt.value === sortBy,
              )?.label || "Sort By"}
              <FaChevronDown className="ml-1" size={12} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            {SORT_OPTIONS.map(
              (option: { value: string; label: string }) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handlePriceSortClick(option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default FilterSortBar;
