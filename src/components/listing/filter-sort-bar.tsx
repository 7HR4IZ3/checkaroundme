import React, { useState, useCallback, useMemo, useEffect } from "react";
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
import { Country, State, City } from "country-state-city";

type FilterSortBarProps = {
  selectedCategories: string[];
  onChangeCategories: (categories: string[]) => void;
  onOpenFiltersPanel: () => void;
  selectedCity: string | null;
  selectedState: string | null;
  selectedCountry: string | null;
  onChangeLocation: (
    location: string | null,
    locationType?: "city" | "state" | "country"
  ) => void;
  openNow: boolean;
  onToggleOpenNow: () => void;
  selectedDistance: string | null;
  onChangeDistance: (distance: string | null) => void;
  sortBy: string;
  onSortByChange: (sortValue: string) => void;
  hasActiveFilters: boolean;
  onClearAllFilters: () => void;
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
  selectedCity,
  selectedState,
  selectedCountry,
  onChangeLocation,
  openNow,
  onToggleOpenNow,
  selectedDistance,
  onChangeDistance,
  sortBy,
  onSortByChange,
  hasActiveFilters,
  onClearAllFilters,
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

  const [selectedCountryState, setSelectedCountryState] = useState<
    string | null
  >(null);
  const [selectedStateState, setSelectedStateState] = useState<string | null>(
    null
  );
  const [selectedCityState, setSelectedCityState] = useState<string | null>(
    null
  );

  useEffect(() => {
    const countries = Country.getAllCountries();
    if (countries.length === 1) {
      setSelectedCountryState(countries[0].isoCode);
    }
  }, []);

  const availableCountries = useMemo(() => {
    return [Country.getCountryByCode("NG")!];
  }, []);

  const availableStates = useMemo(() => {
    if (!selectedCountryState) return [];
    return State.getStatesOfCountry(selectedCountryState);
  }, [selectedCountryState]);

  const availableCities = useMemo(() => {
    if (!selectedCountryState || !selectedStateState) return [];
    return City.getCitiesOfState(selectedCountryState, selectedStateState);
  }, [selectedCountryState, selectedStateState]);

  const handleCountryChange = useCallback(
    (countryCode: string) => {
      if (countryCode === "_all") {
        setSelectedCountryState(null);
        onChangeLocation(null);
        return;
      }
      setSelectedCountryState(countryCode);
      setSelectedStateState(null);
      setSelectedCityState(null);
      onChangeLocation(countryCode, "country");
    },
    [onChangeLocation]
  );

  const handleStateChange = useCallback(
    (stateCode: string) => {
      if (stateCode === "_all") {
        setSelectedStateState(null);
        if (selectedCountryState) {
          onChangeLocation(selectedCountryState, "country");
        }
        return;
      }
      setSelectedStateState(stateCode);
      setSelectedCityState(null);
      if (!selectedCountryState || !stateCode) {
        onChangeLocation(selectedCountryState || null, "country");
      } else {
        onChangeLocation(stateCode, "state");
      }
    },
    [selectedCountryState, onChangeLocation]
  );

  const handleCityChange = useCallback(
    (city: string) => {
      if (city === "_all") {
        setSelectedCityState(null);
        if (selectedStateState) {
          onChangeLocation(selectedStateState, "state");
        }
        return;
      }
      setSelectedCityState(city);
      if (!selectedCountryState || !selectedStateState) return;
      if (!city) {
        onChangeLocation(selectedStateState, "state");
      } else {
        onChangeLocation(city, "city");
      }
    },
    [selectedCountryState, selectedStateState, onChangeLocation]
  );

  const locationDropdownContent = useMemo(
    () => (
      <DropdownMenuContent className="w-[280px] min-h-[110px] max-h-[400px] overflow-y-auto p-2">
        <div className="space-y-2">
          <div>
            <Select
              value={selectedCountryState || "_all"}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Countries</SelectItem>
                {availableCountries.map((country) => (
                  <SelectItem key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCountryState && (
            <div>
              <Select
                value={selectedStateState || "_all"}
                onValueChange={handleStateChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All States</SelectItem>
                  {availableStates.map((state) => (
                    <SelectItem key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedStateState && (
            <div>
              <Select
                value={selectedCityState || "_all"}
                onValueChange={handleCityChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Cities</SelectItem>
                  {availableCities.map((city) => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    ),
    [
      selectedCountryState,
      selectedStateState,
      selectedCityState,
      availableCountries,
      availableStates,
      availableCities,
      handleCountryChange,
      handleStateChange,
      handleCityChange,
    ]
  );

  const LocationButton = useMemo(() => {
    let displayText = "All Locations";
    if (selectedCity) displayText = selectedCity;
    else if (selectedState && selectedCountry) {
      const state = State.getStateByCodeAndCountry(
        selectedState,
        selectedCountry
      );
      displayText = state?.name || selectedState;
    } else if (selectedCountry) {
      const country = Country.getCountryByCode(selectedCountry);
      displayText = country?.name || selectedCountry;
    }

    return (
      <div className="flex items-center justify-between w-full gap-2">
        <span className="truncate">{displayText}</span>
      </div>
    );
  }, [selectedCity, selectedState, selectedCountry]);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2">
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
            <Button variant="outline" size="sm" className="w-[180px]">
              {LocationButton}
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
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-destructive"
          onClick={() => {
            setSelectedCityState(null);
            setSelectedStateState(null);
            setSelectedCountryState(null);
            onClearAllFilters();
          }}
        >
          Clear all filters
        </Button>
      )}
    </div>
  );
};

export default React.memo(FilterSortBar);
