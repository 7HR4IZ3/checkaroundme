import React from "react";
import { Skeleton } from "../ui/skeleton";

const ListingCardSkeleton: React.FC = () => {
  return (
    <div className="container bg-white rounded-lg shadow-xs overflow-hidden flex flex-row p-2 relative h-[21vh] md:h-auto">
      <div className="w-1/2 md:w-40 relative">
        <Skeleton className="h-full w-full rounded-xl bg-gray-200" />
      </div>
      <div className="flex-grow px-4 py-1 md:py-4 flex flex-col justify-between">
        <div className="flex flex-col justify-between gap-1 md:gap-2">
          <div className="flex p-0 justify-between items-start">
            <Skeleton className="h-5 md:h-6 w-3/4 mb-1" />
            <Skeleton className="hidden md:block h-4 w-1/4" />
          </div>
          <div className="flex items-center h-5">
            <Skeleton className="h-3 md:h-4 w-1/4" />
            <Skeleton className="h-3 md:h-4 w-1/6 ml-2" />
            <Skeleton className="h-3 md:h-4 w-1/5 ml-2" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-4 w-1/6 rounded" />
            <Skeleton className="h-4 w-1/5 rounded" />
            <Skeleton className="h-4 w-1/6 rounded" />
          </div>
          <Skeleton className="h-3 md:h-4 w-full mb-1" />
          <Skeleton className="h-3 md:h-4 w-5/6" />
        </div>
        <div className="flex flex-row sm:items-center justify-end align-end mt-auto">
          <Skeleton className="h-8 w-1/3" />
        </div>
      </div>
    </div>
  );
};

export default ListingCardSkeleton;
