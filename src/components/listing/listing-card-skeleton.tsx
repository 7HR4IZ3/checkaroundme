import React from "react";
import { Skeleton } from "../ui/skeleton";

const ListingCardSkeleton: React.FC = () => {
  return (
    <div className="h-[18em] bg-white rounded-lg shadow-xs overflow-hidden flex flex-row p-2 relative">
      <div className="w-[20em] m:w-1/2 relative">
        <Skeleton className="h-full w-full rounded-xl bg-gray-200" />
      </div>
      <div className="flex-grow px-4 py-4 flex flex-col justify-between">
        <div className="flex flex-col justify-between">
          <div className="flex p-0 justify-between items-start">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <div className="flex items-center mt-1 mb-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/6 ml-2" />
            <Skeleton className="h-4 w-1/4 ml-2" />
          </div>
          <div className="flex flex-wrap gap-2 mb-1">
            <Skeleton className="h-4 w-1/6 rounded" />
            <Skeleton className="h-4 w-1/5 rounded" />
            <Skeleton className="h-4 w-1/6 rounded" />
          </div>
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex flex-row sm:items-center justify-end align-end mt-auto">
          <Skeleton className="h-9 w-1/3" />
        </div>
      </div>
    </div>
  );
};

export default ListingCardSkeleton;