"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import CategoryNav from "@/components/listing/category-nav";
import FilterSortBar from "@/components/listing/filter-sort-bar";
import ListingCardsList from "@/components/listing/listing-cards-list";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import MapPlaceholder from "@/components/map/placeholder";
import { trpc } from "@/lib/trpc/client";
import { useRouter, useSearchParams } from "next/navigation";
import { FiltersPanel, Filters } from "@/components/ui/filters";
import Loading from "@/components/ui/loading";
import useGeolocation from "@/lib/hooks/useGeolocation"; // Import useGeolocation
import { LocationData, organizeLocations } from "@/utils/location-helpers";

// Memoize all components that receive props
const MemoizedCategoryNav = React.memo(CategoryNav);
const MemoizedListingCardsList = React.memo(ListingCardsList);
const MemoizedFilterSortBar = React.memo(FilterSortBar);
const MemoizedMapPlaceholder = React.memo(MapPlaceholder);

// Memoize pagination component with its contents
const MemoizedPagination = React.memo(
  ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            aria-disabled={currentPage === 1}
            onClick={() => {
              currentPage >= 1 && onPageChange(currentPage - 1);
              typeof window !== "undefined" &&
                window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }).map((_, i) => (
          <PaginationItem key={i + 1}>
            <PaginationLink
              onClick={() => {
                onPageChange(i + 1);
                typeof window !== "undefined" &&
                  window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              isActive={currentPage === i + 1}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            aria-disabled={currentPage === totalPages}
            onClick={() => {
              currentPage < totalPages && onPageChange(currentPage + 1);
              typeof window !== "undefined" &&
                window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
);

MemoizedPagination.displayName = "MemoizedPagination";

export default function Home() {
  trpc.getAllCategories.usePrefetchQuery(undefined, {
    staleTime: Infinity,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    latitude: userLatitude,
    longitude: userLongitude,
    error: geoError,
    loading: geoLoading,
  } = useGeolocation();

  // Parse main category from URL
  const categoryParam = searchParams?.get("category");
  const selectedCategory =
    categoryParam && categoryParam.length > 0
      ? // Categories gets double encoded for some reason
        decodeURIComponent(decodeURIComponent(categoryParam))
      : null;

  const queryParam = searchParams?.get("query") || "";
  const locationParam = searchParams?.get("location") || "";

  // Replace locationParam with specific location params
  const cityParam = searchParams?.get("city") || "";
  const stateParam = searchParams?.get("state") || "";
  const countryParam = searchParams?.get("country") || "";

  // Filters from FiltersPanel
  const priceParam = searchParams?.get("price");
  const featuresParam = searchParams?.get("features");
  // `distances` from FiltersPanel is deprecated in favor of selectedDistance from FilterSortBar

  const initialFiltersPanelFilters: Filters = useMemo(
    () => ({
      price: priceParam ?? undefined,
      features: featuresParam ? featuresParam.split(",") : [],
      distances: [], // Deprecated, handled by selectedDistance
    }),
    [priceParam, featuresParam]
  );

  // State for FilterSortBar specific filters
  const [otherFilterBarCategories, setOtherFilterBarCategories] = useState<
    string[]
  >(searchParams?.get("other_filters")?.split(",") || []);
  const [openNow, setOpenNow] = useState<boolean>(
    searchParams?.has("open_now")
      ? searchParams?.get("open_now") === "true"
      : false
  );
  const [selectedDistance, setSelectedDistance] = useState<string | null>(
    searchParams?.get("max_distance") || "any"
  ); // e.g., "5km", "10km"
  const [sortBy, setSortBy] = useState<string>(
    searchParams?.get("sort_by") || "top"
  ); // e.g., "rating", "distance", "price_asc"

  // Pagination
  const limitParam = searchParams?.get("limit");
  const offsetParam = searchParams?.get("offset");
  const limit = limitParam ? parseInt(limitParam, 10) : 10;
  const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);

  // Update URL when filter states change
  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString());

    // Main category
    if (selectedCategory)
      params.set("category", encodeURIComponent(selectedCategory));
    else params.delete("category");

    // Query and Location
    if (queryParam) params.set("query", queryParam);
    else params.delete("query");
    if (locationParam) params.set("location", locationParam);
    else params.delete("location");

    // FiltersPanel filters
    if (initialFiltersPanelFilters.price)
      params.set("price", initialFiltersPanelFilters.price);
    else params.delete("price");
    if (initialFiltersPanelFilters.features.length > 0)
      params.set("features", initialFiltersPanelFilters.features.join(","));
    else params.delete("features");

    // FilterSortBar filters
    if (otherFilterBarCategories.length > 0)
      params.set("other_filters", otherFilterBarCategories.join(","));
    else params.delete("other_filters");
    if (openNow) params.set("open_now", "true");
    else params.delete("open_now");
    if (selectedDistance) params.set("max_distance", selectedDistance);
    else params.delete("max_distance");
    if (sortBy) params.set("sort_by", sortBy);
    else params.delete("sort_by");

    // Pagination
    params.set("limit", limit.toString());
    params.set("offset", offset.toString());

    // Only push if params actually changed to avoid loops, though router.replace is safer
    if (
      params.toString() !==
      new URLSearchParams(searchParams?.toString()).toString()
    ) {
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [
    selectedCategory,
    queryParam,
    locationParam,
    initialFiltersPanelFilters,
    otherFilterBarCategories,
    openNow,
    selectedDistance,
    sortBy,
    limit,
    offset,
    router,
    searchParams,
  ]);

  const updateUrlAndResetOffset = useCallback(
    (newParams: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams?.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      params.set("offset", "0"); // Reset to first page
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const onChangeCategory = useCallback(
    (category: string | null) => {
      updateUrlAndResetOffset({
        category: category ? encodeURIComponent(category) : null,
      });
    },
    [updateUrlAndResetOffset]
  );

  const onOpenFiltersPanel = useCallback(() => setFiltersPanelOpen(true), []);
  const onCloseFiltersPanel = useCallback(() => setFiltersPanelOpen(false), []);

  const onApplyFilters = useCallback(
    (filters: Filters) => {
      const newParams: Record<string, string | null> = {};
      newParams.price = filters.price ?? null;
      newParams.features =
        filters.features.length > 0 ? filters.features.join(",") : null;
      // distances from panel is deprecated
      updateUrlAndResetOffset(newParams);
      onCloseFiltersPanel();
    },
    [updateUrlAndResetOffset, onCloseFiltersPanel]
  );

  const onChangeOtherFilterBarCategories = useCallback(
    (categories: string[]) => {
      setOtherFilterBarCategories(categories); // State update will trigger useEffect
    },
    []
  );

  const onToggleOpenNow = useCallback(() => {
    setOpenNow((prev) => !prev); // State update will trigger useEffect
  }, []);

  const onChangeDistance = useCallback((distance: string | null) => {
    setSelectedDistance(distance); // State update will trigger useEffect
  }, []);

  const onSortByChange = useCallback((sortValue: string) => {
    setSortBy(sortValue); // State update will trigger useEffect
  }, []);

  const onPageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams?.toString());
      const newPage = Math.max(1, page);
      params.set("offset", ((newPage - 1) * limit).toString());
      // limit is already in useEffect dependency, so no need to set it here again
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams, limit]
  );

  // const combinedCategoriesForQuery = useMemo(() => {
  //   const mainCat = selectedCategory ? [selectedCategory] : [];
  //   return [...mainCat, ...otherFilterBarCategories];
  // }, [selectedCategory, otherFilterBarCategories]);

  const maxDistanceKm = useMemo(() => {
    if (!selectedDistance || selectedDistance === "any") return undefined;
    return parseInt(selectedDistance.replace("km", ""), 10);
  }, [selectedDistance]);

  const { sortField, sortDirection } = useMemo(() => {
    if (sortBy.includes("_")) {
      const [field, direction] = sortBy.split("_");
      return { sortField: field, sortDirection: direction };
    }
    return { sortField: sortBy, sortDirection: "desc" }; // Default desc for rating, distance
  }, [sortBy]);

  const { data: list, isLoading: queryIsLoading } =
    trpc.listBusinesses.useQuery(
      {
        category: selectedCategory || "",
        query: queryParam,
        location:
          !cityParam && !stateParam && !countryParam
            ? locationParam
            : undefined,
        city: cityParam,
        state: stateParam,
        country: countryParam,
        limit,
        offset,
        price: initialFiltersPanelFilters.price,
        features: initialFiltersPanelFilters.features,
        openNow: openNow,
        userLatitude: userLatitude === null ? undefined : userLatitude,
        userLongitude: userLongitude === null ? undefined : userLongitude,
        maxDistanceKm: maxDistanceKm,
        sortBy: sortField,
        sortDirection: sortDirection as "asc" | "desc",
      },
      { enabled: !geoLoading, staleTime: Infinity }
    );

  const isLoading = queryIsLoading || geoLoading;

  // const locations = useMemo(() => {
  //   if (!list?.businesses) return [];
  //   const uniqueLocations = new Set(
  //     list.businesses.map((b) => `${b.city}, ${b.country}`)
  //   );
  //   return Array.from(uniqueLocations);
  // }, [list?.businesses]);

  const onChangeLocation = useCallback(
    (
      newLocation: string | null,
      locationType?: "city" | "state" | "country"
    ) => {
      if (!newLocation) {
        updateUrlAndResetOffset({
          city: null,
          state: null,
          country: null,
        });
        return;
      }

      // Update URL based on location type
      switch (locationType) {
        case "city":
          updateUrlAndResetOffset({
            city: newLocation,
            state: stateParam,
            country: countryParam,
          });
          break;
        case "state":
          // newLocation is already the state code
          updateUrlAndResetOffset({
            city: null,
            state: newLocation,
            country: countryParam,
          });
          break;
        case "country":
          // newLocation is already the country code
          updateUrlAndResetOffset({
            city: null,
            state: null,
            country: newLocation,
          });
          break;
        default:
          // Legacy support
          updateUrlAndResetOffset({ location: newLocation });
      }
    },
    [updateUrlAndResetOffset, stateParam, countryParam]
  );

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = useMemo(() => {
    if (!list || isLoading) return 1;
    return Math.max(1, Math.ceil((list.total || 0) / limit));
  }, [isLoading, list, limit]);

  // Add for showing range info
  const totalEntries = list?.total || 0;
  const showingFrom = totalEntries === 0 ? 0 : (currentPage - 1) * limit + 1;
  const showingTo = Math.min(currentPage * limit, totalEntries);

  // Store initial locations
  const [initialLocations, setInitialLocations] = useState<LocationData[]>([]);
  // const locationsHierarchy = useMemo(() => {
  //   return organizeLocations(initialLocations);
  // }, [initialLocations]);

  // Update initialLocations only when first data arrives
  useEffect(() => {
    if (list?.businesses && (!location || initialLocations.length === 0)) {
      const uniqueLocations = new Set<string>();
      const locationsList: LocationData[] = [];

      list.businesses.forEach((b) => {
        const locationKey = `${b.city}:${b.state}:${b.country}`;
        if (!uniqueLocations.has(locationKey)) {
          uniqueLocations.add(locationKey);
          locationsList.push({
            city: b.city,
            stateCode: b.state,
            countryCode: b.country!,
          });
        }
      });

      setInitialLocations(locationsList);
    }
  }, [list?.businesses, initialLocations.length, location]);

  // Add function to check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      selectedCategory !== null ||
      locationParam !== null ||
      openNow ||
      selectedDistance !== null ||
      otherFilterBarCategories.length > 0 ||
      initialFiltersPanelFilters.price !== undefined ||
      initialFiltersPanelFilters.features.length > 0
    );
  }, [
    selectedCategory,
    locationParam,
    openNow,
    selectedDistance,
    otherFilterBarCategories,
    initialFiltersPanelFilters,
  ]);

  // Add function to clear all filters
  const handleClearAllFilters = useCallback(() => {
    onChangeCategory(null);
    onChangeLocation(null);
    setOpenNow(false);
    setSelectedDistance(null);
    onChangeOtherFilterBarCategories([]);
    onApplyFilters({ price: undefined, features: [] });
    setSortBy("top");
    // router.push("/listings");
  }, [
    onChangeCategory,
    onChangeLocation,
    onChangeOtherFilterBarCategories,
    onApplyFilters,
  ]);

  return (
    <>
      <MemoizedCategoryNav
        selectedCategory={selectedCategory}
        onChangeCategory={onChangeCategory}
      />
      <div className="mx-auto px-2 md:px-8 lg:px-16">
        <div className="flex flex-row gap-8">
          <div className="w-full md:w-2/5 py-8 space-y-4">
            <h1 className="text-lg md:text-2xl font-semibold text-gray-800">
              {selectedCategory || "All Service Providers"}
              {locationParam ? ` in ${locationParam}` : ""}
            </h1>
            <MemoizedFilterSortBar
              selectedCategories={otherFilterBarCategories}
              onChangeCategories={onChangeOtherFilterBarCategories}
              onOpenFiltersPanel={onOpenFiltersPanel}
              // locations={locations}
              // selectedLocation={null}
              selectedCity={cityParam}
              selectedState={stateParam}
              selectedCountry={countryParam}
              onChangeLocation={onChangeLocation}
              openNow={openNow}
              onToggleOpenNow={onToggleOpenNow}
              selectedDistance={selectedDistance}
              onChangeDistance={onChangeDistance}
              sortBy={sortBy}
              onSortByChange={onSortByChange}
              // locationsHierarchy={locationsHierarchy}
              hasActiveFilters={hasActiveFilters}
              onClearAllFilters={handleClearAllFilters}
            />
            <div
              className="space-y-6 w-full md:h-[80vh] overflow-y-auto pr-4 
              [&::-webkit-scrollbar]:w-2
              [&::-webkit-scrollbar-track]:bg-gray-100
              [&::-webkit-scrollbar-thumb]:bg-gray-300
              [&::-webkit-scrollbar-thumb]:rounded-full
              hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
              scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 
              scrollbar-thumb-rounded-full hover:scrollbar-thumb-gray-400"
            >
              <MemoizedListingCardsList
                isLoading={isLoading}
                geoError={geoError}
                userLatitude={userLatitude}
                businesses={list?.businesses}
              />
            </div>

            {/* Updated Pagination Section */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {showingFrom} to {showingTo} of {totalEntries} entries
                </div>
                <MemoizedPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                />
              </div>
            )}
          </div>

          {/* Map section with memoized component */}
          <div className="hidden md:flex flex-col items-center justify-center h-[100vh] w-2/3">
            <div className="h-[80vh] w-full">
              <MemoizedMapPlaceholder businesses={list?.businesses || []} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters panel remains unchanged */}
      {filtersPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="h-full bg-white w-full max-w-xs animate-in fade-in slide-in-from-left overflow-auto">
            <div className="flex justify-end p-2">
              <button
                className="text-gray-500 hover:text-gray-800 text-2xl"
                onClick={onCloseFiltersPanel}
                aria-label="Close filters"
              >
                &times;
              </button>
            </div>
            <FiltersPanel
              initialFilters={initialFiltersPanelFilters}
              onApplyFilters={onApplyFilters}
              onClose={onCloseFiltersPanel}
            />
          </div>
          <div
            className="flex-1"
            onClick={onCloseFiltersPanel}
            aria-label="Close filters overlay"
          />
        </div>
      )}
    </>
  );
}
