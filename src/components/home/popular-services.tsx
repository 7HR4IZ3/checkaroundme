import React, { Suspense } from "react";
import { trpc } from "@/lib/trpc/server"; // Import server-side tRPC
import ListingCard from "../listing/listing-card";
import ListingCardSkeleton from "../listing/listing-card-skeleton";

const PopularServices = async () => {
  let error: any;

  const { businesses } = await trpc.listBusinesses({ limit: 4, sortBy: "createdAt" });

  if (error) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8">
            Popular Services
          </h2>
          <div className="text-red-600">Failed to load popular services.</div>
        </div>
      </div>
    );
  }

  // Display skeletons while data is being fetched on the server
  // This part might need adjustment depending on how server rendering handles loading states
  // For now, we'll assume the data is available by the time the component renders
  if (!businesses) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="xl:container px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8">
            Popular Services
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

  return (
    <div className="bg-gray-50 py-16">
      <div className="xl:container px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">
          Popular Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {businesses.map((business) => (
            <Suspense key={business.$id} fallback={<ListingCardSkeleton />}>
              <ListingCard hideButton={true} business={business} />
            </Suspense>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularServices;
