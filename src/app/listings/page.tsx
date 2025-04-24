"use client";

import React, { useState, useCallback, useMemo } from "react";
import CategoryNav from "@/components/listing/category-nav";
import FilterSortBar from "@/components/listing/filter-sort-bar";
import ListingCard from "@/components/listing/listing-card";
import Pagination from "@/components/ui/pagination";
import MapPlaceholder from "@/components/map/placeholder";
import { trpc } from "@/lib/trpc/client";
import { useRouter, useSearchParams } from "next/navigation";
import { FiltersPanel } from "@/components/ui/filters";
import Loading from "@/components/ui/loading";

export default function Home() {
  // Prefetch
  trpc.getAllCategories.usePrefetchQuery();

  // State for FilterSortBar special filters (e.g., "Open Now", "Offers Delivery")
  const [filterBarCategories, setFilterBarCategories] = useState<string[]>([]);

  // Handler for FilterSortBar special filters (multi-select)
  const onChangeFilterBarCategories = useCallback((categories: string[]) => {
    setFilterBarCategories(categories);
  }, []);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse category from URL (single-select)
  const categoryParam = searchParams.get("categories");
  const selectedCategory =
    categoryParam && categoryParam.length > 0 ? categoryParam : null;

  // Parse query and location from URL
  const queryParam = searchParams.get("query") || "";
  const locationParam = searchParams.get("location") || "";

  // Parse pagination from URL
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");
  const limit = limitParam ? parseInt(limitParam, 10) : 10;
  const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

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

  // Query businesses with category, query, location, and pagination
  const { data: list, isLoading } = trpc.listBusinesses.useQuery({
    categories: selectedCategory
      ? [selectedCategory, ...filterBarCategories]
      : filterBarCategories,
    query: queryParam,
    location: locationParam,
    limit,
    offset,
  });

  // Calculate pagination
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = useMemo(() => {
    if (!list || isLoading) return 1;
    return Math.max(1, Math.ceil(list.total / limit));
  }, [isLoading]);

  return (
    <>
      <CategoryNav
        selectedCategory={selectedCategory}
        onChangeCategory={onChangeCategory}
      />
      <div className="container flex flex-row mx-auto px-4 py-8 min-h-[70vh]">
        <div className="flex flex-row gap-8 w-full">
          {/* Listings Section */}
          <div className="w-2/3">
            <h1 className="text-2xl font-semibold mb-4 text-gray-800">
              Auto Mechanics near Lekki, Lagos
            </h1>
            <FilterSortBar
              selectedCategories={filterBarCategories}
              onChangeCategories={onChangeFilterBarCategories}
              onOpenFiltersPanel={onOpenFiltersPanel}
            />
            <div className="space-y-6">
              {isLoading ? (
                <Loading />
              ) : (!list) ? (
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
          <div className="hidden md:block flex-grow">
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
            <FiltersPanel />
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
