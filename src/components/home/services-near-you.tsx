"use client";

import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import ListingCard from "../listing/listing-card";
import { Skeleton } from "../ui/skeleton";

const ServicesNearYou = () => {
  // const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  // const [geoLoading, setGeoLoading] = useState(true);
  // const [geoError, setGeoError] = useState<string | null>(null);

  // useEffect(() => {
  //   if (!navigator.geolocation) {
  //     setGeoError("Geolocation is not supported by your browser.");
  //     setGeoLoading(false);
  //     return;
  //   }
  //   navigator.geolocation.getCurrentPosition(
  //     (position) => {
  //       setCoords({
  //         latitude: position.coords.latitude,
  //         longitude: position.coords.longitude,
  //       });
  //       setGeoLoading(false);
  //     },
  //     (error) => {
  //       setGeoError("Unable to retrieve your location.");
  //       setGeoLoading(false);
  //     }
  //   );
  // }, []);

  // const { data: businesses, isLoading, error } = trpc.getNearbyBusinesses.useQuery(
  //   coords
  //     ? { longitude: coords.longitude, latitude: coords.latitude }
  //     : // Don't run query if no coords yet
  //       { longitude: 0, latitude: 0 },
  //   {
  //     enabled: !!coords, // Only run when coords are available
  //   }
  // );

  const { data: businesses, isLoading, error } = trpc.listBusinesses.useQuery({ limit: 7 });

  // if (geoLoading) {
  //   return (
  //     <div className="bg-gray-50 py-16">
  //       <div className="container px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
  //         <h2 className="text-2xl font-semibold text-gray-800 mb-8">
  //           Services Near You
  //         </h2>
  //         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //           {[...Array(6)].map((_, i) => (
  //             <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col sm:flex-row p-2">
  //               <Skeleton className="h-[100px] w-[130px] rounded-lg bg-gray-200" />
  //               <div className="px-4 flex flex-col justify-between flex-grow">
  //                 <div>
  //                   <Skeleton className="h-[1.5rem] w-5/6 mb-2" />
  //                   <Skeleton className="h-[1rem] w-4/6 mb-2" />
  //                   <div className="flex flex-wrap gap-2 mb-1">
  //                     <Skeleton className="h-[0.8rem] w-[50px] rounded text-xs font-medium" />
  //                     <Skeleton className="h-[0.8rem] w-[60px] rounded text-xs font-medium" />
  //                     <Skeleton className="h-[0.8rem] w-[40px] rounded text-xs font-medium" />
  //                   </div>
  //                   <Skeleton className="h-[1rem] w-5/6 mb-2" />
  //                 </div>
  //                 <div className="flex flex-row sm:items-center justify-between pt-3 align-end mt-auto border-t border-gray-100">
  //                   <div className="flex items-center text-sm text-gray-500">
  //                     <Skeleton className="h-[1rem] w-[70px]" />
  //                   </div>
  //                   <Skeleton className="h-[2.25rem] w-[90px]" />
  //                 </div>
  //               </div>
  //             </div>
  //           ))}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // if (geoError) {
  //   return (
  //     <div className="bg-gray-50 py-16">
  //       <div className="container px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
  //         <h2 className="text-2xl font-semibold text-gray-800 mb-8">
  //           Services Near You
  //         </h2>
  //         <div className="text-red-600">{geoError}</div>
  //       </div>
  //     </div>
  //   );
  // }

  if (isLoading) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8">
            Services Near You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col sm:flex-row p-2">
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
          {businesses?.businesses.map((business) => (
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
