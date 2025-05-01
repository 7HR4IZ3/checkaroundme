"use client";

import React, { useState, useCallback, useMemo } from "react";
import CategoryNav from "@/components/listing/category-nav";
import FilterSortBar from "@/components/listing/filter-sort-bar";
import ListingCard from "@/components/listing/listing-card";
import Pagination from "@/components/ui/pagination";
import MapPlaceholder from "@/components/map/placeholder";
import { trpc } from "@/lib/trpc/client";
import { useRouter, useSearchParams } from "next/navigation";
import { FiltersPanel, Filters } from "@/components/ui/filters"; // Import Filters type
import Loading from "@/components/ui/loading";
import { Input } from "@/components/ui/input"; // Import Input component
import { Button } from "@/components/ui/button"; // Import Button component

export default function Home() {
  // Prefetch
  trpc.getAllCategories.usePrefetchQuery();

  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse filters from URL
  const categoryParam = searchParams.get("categories");
  const selectedCategory =
    categoryParam && categoryParam.length > 0 ? categoryParam : null;

  const queryParam = searchParams.get("query") || "";
  const locationParam = searchParams.get("location") || "";

  const priceParam = searchParams.get("price");
  const featuresParam = searchParams.get("features");
  const distancesParam = searchParams.get("distances");

  const initialFilters: Filters = useMemo(
    () => ({
      price: priceParam ?? undefined, // Assign undefined if priceParam is null
      features: featuresParam ? featuresParam.split(",") : [],
      distances: distancesParam ? distancesParam.split(",") : [],
    }),
    [priceParam, featuresParam, distancesParam]
  );

  // State for FilterSortBar special filters (e.g., "Open Now", "Offers Delivery")
  // These are separate from the main FiltersPanel filters but can be combined for the query
  const [filterBarCategories, setFilterBarCategories] = useState<string[]>([]);

  // Handler for FilterSortBar special filters (multi-select)
  const onChangeFilterBarCategories = useCallback((categories: string[]) => {
    setFilterBarCategories(categories);
  }, []);

  // Parse pagination from URL
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");
  const limit = limitParam ? parseInt(limitParam, 10) : 5; // Use base 10 for parseInt
  const offset = offsetParam ? parseInt(offsetParam, 10) : 0; // Use base 10 for parseInt

  // Filters panel state
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);

  // Handler to update category in URL (single-select)
  const onChangeCategory = useCallback(
    (category: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (category) {
        params.set("categories", category);
      } else {
        params.delete("categories");
      }
      // Reset to first page when filters change
      params.set("offset", "0");
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Handler to open filters panel
  const onOpenFiltersPanel = useCallback(() => {
    setFiltersPanelOpen(true);
  }, []);

  // Handler to close filters panel
  const onCloseFiltersPanel = useCallback(() => {
    setFiltersPanelOpen(false);
  }, []);

  // Handler to apply filters from FiltersPanel
  const onApplyFilters = useCallback(
    (filters: Filters) => {
      const params = new URLSearchParams(searchParams.toString());

      if (filters.price) {
        params.set("price", filters.price);
      } else {
        params.delete("price");
      }

      if (filters.features.length > 0) {
        params.set("features", filters.features.join(","));
      } else {
        params.delete("features");
      }

      if (filters.distances.length > 0) {
        params.set("distances", filters.distances.join(","));
      } else {
        params.delete("distances");
      }

      // Reset to first page when filters change
      params.set("offset", "0");
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Handler to change page
  const onPageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      // Clamp page to valid range
      const newPage = Math.max(1, page);
      params.set("offset", ((newPage - 1) * limit).toString());
      params.set("limit", limit.toString());
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams, limit]
  );

  // Combine filterBarCategories and selectedCategory for the query
  const combinedCategories = useMemo(() => {
    const categories = selectedCategory ? [selectedCategory] : [];
    return [...categories, ...filterBarCategories];
  }, [selectedCategory, filterBarCategories]);

  // Query businesses with category, query, location, and pagination
  const { data: list, isLoading } = trpc.listBusinesses.useQuery({
    categories: combinedCategories,
    query: queryParam,
    location: locationParam, // Use locationParam from URL
    limit,
    offset,
    price: initialFilters.price, // Pass price filter
    features: initialFilters.features, // Pass features filter
    distances: initialFilters.distances, // Pass distances filter
  });

  // Extract unique locations from the business list
  const locations = useMemo(() => {
    if (!list?.businesses) return [];
    const uniqueLocations = new Set(
      list.businesses.map((b) => `${b.city} ${b.country}`)
    );
    return Array.from(uniqueLocations);
  }, [list?.businesses]);

  // Handler to update location in URL
  const onChangeLocation = useCallback(
    (location: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (location) {
        params.set("location", location);
      } else {
        params.delete("location");
      }
      // Reset to first page when location changes
      params.set("offset", "0");
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Calculate pagination
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = useMemo(() => {
    if (!list || isLoading) return 1;
    return Math.max(1, Math.ceil(list.total / limit));
  }, [isLoading, list, limit]); // Add list and limit to dependencies

  return (
    <>
      <CategoryNav
        selectedCategory={selectedCategory}
        onChangeCategory={onChangeCategory}
      />
      <div className="container flex flex-row mx-auto px-4 py-8 min-h-[70vh]">
        <div className="flex flex-row flex-wrap gap-8 w-full">
          {/* Listings Section */}
          <div className="">
            {/* Display current category and location */}
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
              {selectedCategory || "All business"} near {locationParam || "You"}
            </h1>
            <FilterSortBar
              selectedCategories={filterBarCategories}
              onChangeCategories={onChangeFilterBarCategories}
              onOpenFiltersPanel={onOpenFiltersPanel}
              locations={locations} // Pass locations
              selectedLocation={locationParam} // Pass selectedLocation
              onChangeLocation={onChangeLocation} // Pass onChangeLocation
            />
            <div className="space-y-6">
              {isLoading ? (
                <Loading />
              ) : !list || list.businesses.length === 0 ? ( // Check for empty businesses array
                <div className="text-center text-gray-500">
                  No businesses found.
                </div>
              ) : (
                list.businesses.map((business, index) => (
                  <ListingCard key={index} business={business} />
                ))
              )}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>

          {/* Map Section */}
          <div className="md:w-1/3 flex-grow">
            <MapPlaceholder />
          </div>
        </div>
      </div>
      {/* Right-side Filters Panel (modal for mobile/tablet only) */}

      {filtersPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="h-full bg-white w-full max-w-xs animate-in fade-in slide-in-from-left">
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
              initialFilters={initialFilters}
              onApplyFilters={onApplyFilters}
              onClose={onCloseFiltersPanel}
            />
          </div>
          {/* Click outside to close */}
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
