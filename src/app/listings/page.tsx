"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import CategoryNav from "@/components/listing/category-nav";
import FilterSortBar from "@/components/listing/filter-sort-bar";
import ListingCard from "@/components/listing/listing-card";
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

export default function Home() {
  trpc.getAllCategories.usePrefetchQuery();

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
    searchParams?.get("open_now") === "true"
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
        location: locationParam,
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
      { enabled: !geoLoading, refetchInterval: false } // Only enable query once geolocation is resolved (or errored)
    );

  const isLoading = queryIsLoading || geoLoading;

  const locations = useMemo(() => {
    if (!list?.businesses) return [];
    const uniqueLocations = new Set(
      list.businesses.map((b) => `${b.city}, ${b.country}`)
    );
    return Array.from(uniqueLocations);
  }, [list?.businesses]);

  const onChangeLocation = useCallback(
    (newLocation: string | null) => {
      updateUrlAndResetOffset({ location: newLocation });
    },
    [updateUrlAndResetOffset]
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
  const locationsHierarchy = useMemo(() => {
    return organizeLocations(initialLocations);
  }, [initialLocations]);

  // Update initialLocations only when first data arrives
  useEffect(() => {
    if (
      list?.businesses &&
      (!location || initialLocations.length === 0)
    ) {
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

  return (
    <>
      <CategoryNav
        selectedCategory={selectedCategory}
        onChangeCategory={onChangeCategory}
      />
      <div className="container mx-auto px-4">
        <div className="flex flex-row gap-8">
          {/* Main content - Takes 2/3 on tablet, 5/8 on desktop */}
          <div className="w-2/3 py-8 space-y-4">
            <h1 className="text-lg md:text-2xl font-semibold text-gray-800">
              {selectedCategory || "All Service Providers"}
              {locationParam ? ` in ${locationParam}` : ""}
            </h1>
            <FilterSortBar
              selectedCategories={otherFilterBarCategories}
              onChangeCategories={onChangeOtherFilterBarCategories}
              onOpenFiltersPanel={onOpenFiltersPanel}
              locations={locations}
              selectedLocation={locationParam}
              onChangeLocation={onChangeLocation}
              openNow={openNow}
              onToggleOpenNow={onToggleOpenNow}
              selectedDistance={selectedDistance}
              onChangeDistance={onChangeDistance}
              sortBy={sortBy}
              onSortByChange={onSortByChange}
              locationsHierarchy={locationsHierarchy}
            />
            <div className="space-y-6 w-full">
              {isLoading ? (
                <Loading />
              ) : geoError && !userLatitude ? (
                <div className="text-center text-gray-500">
                  Could not determine your location. Please enable location
                  services or select a location manually.
                </div>
              ) : !list || list.businesses.length === 0 ? (
                <div className="text-center text-gray-500">
                  No service providers found matching your criteria.
                </div>
              ) : (
                list.businesses.map((business, index) => (
                  <ListingCard
                    key={business.$id || index}
                    business={business}
                  />
                ))
              )}
            </div>
            {/* Updated Pagination Section */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {showingFrom} to {showingTo} of {totalEntries} entries
                </div>
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
                          currentPage < totalPages &&
                            onPageChange(currentPage + 1);
                          typeof window !== "undefined" &&
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>

          {/* Map section - Takes 1/3 on tablet, 3/8 on desktop */}
          <div className="hidden md:flex flex-col items-center justify-center h-[100vh] w-1/3">
            <div className="h-[60vh] w-full">
              <MapPlaceholder businesses={list?.businesses || []} />
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
