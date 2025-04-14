import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import ListingCard from "../listing/listing-card";

const ServicesNearYou = () => {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      setGeoLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGeoLoading(false);
      },
      (error) => {
        setGeoError("Unable to retrieve your location.");
        setGeoLoading(false);
      }
    );
  }, []);

  const { data: businesses, isLoading, error } = trpc.getNearbyBusinesses.useQuery(
    coords
      ? { longitude: coords.longitude, latitude: coords.latitude }
      : // Don't run query if no coords yet
        { longitude: 0, latitude: 0 },
    {
      enabled: !!coords, // Only run when coords are available
    }
  );

  if (geoLoading) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8">
            Services Near You
          </h2>
          <div>Detecting your location...</div>
        </div>
      </div>
    );
  }

  if (geoError) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8">
            Services Near You
          </h2>
          <div className="text-red-600">{geoError}</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8">
            Services Near You
          </h2>
          <div>Loading nearby services...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
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
      <div className="container px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">
          Services Near You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {businesses?.map((business) => (
            <ListingCard key={business.$id} hideButton={true} business={business} />
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
