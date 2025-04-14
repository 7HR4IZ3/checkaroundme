"use client";

import React, { useState, useCallback } from "react";
import CategoryNav from "@/components/listing/category-nav";
import FilterSortBar from "@/components/listing/filter-sort-bar";
import ListingCard from "@/components/listing/listing-card";
import Pagination from "@/components/ui/pagination";
import MapPlaceholder from "@/components/map/placeholder";
import { trpc } from "@/lib/trpc/client";
import { useRouter, useSearchParams } from "next/navigation";
import { FiltersPanel } from "@/components/ui/filters";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse categories from URL (comma-separated)
  const categoriesParam = searchParams.get("categories");
  const selectedCategories = categoriesParam
    ? categoriesParam.split(",").filter(Boolean)
    : [];

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

  // Handler to update categories in URL
  const onChangeCategories = useCallback(
    (categories: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (categories.length > 0) {
        params.set("categories", categories.join(","));
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

  // Query businesses with categories, query, location, and pagination
  const { data: list, isLoading } = trpc.listBusinesses.useQuery({
    categories: selectedCategories,
    query: queryParam,
    location: locationParam,
    limit,
    offset,
  });

  if (!list || isLoading) {
    return null;
  }

  // Calculate pagination
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(list.total / limit));

  return (
    <>
      <CategoryNav />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Listings Section */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-semibold mb-4 text-gray-800">
              Auto Mechanics near Lekki, Lagos
            </h1>
            <FilterSortBar
              selectedCategories={selectedCategories}
              onChangeCategories={onChangeCategories}
              onOpenFiltersPanel={onOpenFiltersPanel}
            />
            <div className="space-y-6">
              {list.businesses.map((business, index) => (
                <ListingCard key={index} business={business} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>

          {/* Map Section */}
          <div className="lg:col-span-1">
            <MapPlaceholder />
          </div>
        </div>
      </div>
      {/* Right-side Filters Panel (simple modal for now) */}
      {filtersPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="h-full bg-white shadow-lg w-full max-w-xs">
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
