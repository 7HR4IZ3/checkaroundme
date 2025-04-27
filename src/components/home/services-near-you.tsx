"use client";

import React, { useState, useEffect } from "react";
import { useGeolocation } from "@uidotdev/usehooks";
import { trpc } from "@/lib/trpc/client";
import ListingCard from "../listing/listing-card";
import { Skeleton } from "../ui/skeleton";

const ServicesNearYou = () => {
  const {
    loading: geoLoading,
    error: geoError,
    ...cordinates
  } = useGeolocation();

  console.log(geoError, cordinates)

  const {
    data: businesses,
    isLoading: queryLoading,
    error: queryError,
  } = trpc.getNearbyBusinesses.useQuery({
    limit: 6,
    latitude: cordinates.latitude as number,
    longitude: cordinates.longitude as number,
  }, { enabled: !!cordinates.latitude });

  if (geoError) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8">
            Services Near You
          </h2>
          <div className="text-red-600">
            <p>Enable permissions to access your location data</p>
          </div>
        </div>
      </div>
    );
  }

  if (queryLoading || geoLoading) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="xl:container px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8">
            Services Near You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col sm:flex-row p-2"
              >
                <Skeleton className="h-[100px] w-[130px] rounded-lg bg-gray-200" />
                <div className="px-4 flex flex-col justify-between flex-grow">
                  <div>
                    <Skeleton className="h-[1.5rem] w-5/6 mb-2" />
                    <Skeleton className="h-[1rem] w-4/6 mb-2" />
                    <div className="flex flex-wrap gap-2 mb-1">
                      <Skeleton className="h-[0.8rem] w-[50px] rounded text-xs font-medium" />
                      <Skeleton className="h-[0.8rem] w-[60px] rounded text-xs font-medium" />
                      <Skeleton className="h-[0.8rem] w-[40px] rounded text-xs font-medium" />
                    </div>
                    <Skeleton className="h-[1rem] w-5/6 mb-2" />
                  </div>
                  <div className="flex flex-row sm:items-center justify-between pt-3 align-end mt-auto border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <Skeleton className="h-[1rem] w-[70px]" />
                    </div>
                    <Skeleton className="h-[2.25rem] w-[90px]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="xl:container px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8">
            Services Near You
          </h2>
          <div className="text-red-600">Failed to load services.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-16">
      <div className="xl:container px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">
          Services Near You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {businesses?.map((business) => (
            <ListingCard
              key={business.$id}
              hideButton={true}
              business={business}
            />
          ))}
        </div>
        {/* Optional: Add a "View More" button */}
        {/* <div className="text-center mt-8">
           <button className="text-blue-600 hover:underline">
             Load More Services
           </button>
         </div> */}
      </div>
    </div>
  );
};

export default ServicesNearYou;
