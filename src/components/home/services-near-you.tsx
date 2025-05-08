"use client";

import React, { useState, useEffect } from "react";
import useGeolocation from "@/lib/hooks/useGeolocation"; // Import custom hook
import { trpc } from "@/lib/trpc/client";
import ListingCard from "../listing/listing-card";
import ListingCardSkeleton from "../listing/listing-card-skeleton"; // Import the new skeleton component
import { Business } from "@/lib/schema";

const ServicesNearYou = () => {
  const {
    loading: geoLoading,
    error: geoError,
    ...cordinates
  } = useGeolocation();

  console.log(geoError, cordinates);

  const {
    data: businesses,
    isLoading: queryLoading,
    error: queryError,
  } = trpc.getNearbyBusinesses.useQuery(
    {
      limit: 6,
      latitude: cordinates.latitude as number,
      longitude: cordinates.longitude as number,
    },
    { enabled: !!cordinates.latitude },
  );

  if (geoError) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="mdntainer px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
          <h2 className="text-lg md:text-2xl font-semibold text-center text-gray-800 mb-8">
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
        <div className="md:container px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
          <h2 className="text-lg md:text-2xl font-semibold text-center text-gray-800 mb-8">
            Services Near You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="md:container px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
          <h2 className="text-lg md:text-2xl font-semibold text-center text-gray-800 mb-8">
            Services Near You
          </h2>
          <div className="text-red-600">Failed to load services.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-16">
      <div className="md:container px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
        <h2 className="text-lg md:text-2xl font-semibold text-center text-gray-800 mb-8">
          Services Near You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
          {businesses?.map((business: Business) => (
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
