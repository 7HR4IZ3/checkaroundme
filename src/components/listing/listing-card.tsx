import React from "react";
import Image from "next/image";
import Link from "next/link";

import { FaMapMarkerAlt, FaCommentDots } from "react-icons/fa";
import RatingStars from "@/components/ui/rating-stars";
import { Button } from "@/components/ui/button"; // Use the reusable button
import { Business } from "@/lib/schema";
import { trpc } from "@/lib/trpc/client";

const ListingCard: React.FC<{ business: Business; hideButton?: boolean }> = ({
  business,
  hideButton = false,
}) => {
  const { data: image } = trpc.getBusinessImage.useQuery({
    businessId: business.$id,
  });

  return (
    <div className="h-[15em] bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-row p-2 relative">
      <div className="w-[15em] m:w-1/2 relative">
        <Image
          src={image?.imageUrl!}
          alt={business.name}
          object-fit="cover"
          fill
          className="rounded-xl bg-gray-200" // Background while loading
        />
      </div>
      <div className="flex-grow px-4 py-4 flex flex-col justify-between">
        <div className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <Link href={`/business/${business.$id}`}>
              <h3 className="text-xl font-semibold text-gray-800">
                {business.name}
              </h3>
            </Link>
            <div className="flex items-center font-bold text-xs text-gray-500">
              <FaMapMarkerAlt className="mr-1.5" />
              <span>{business.addressLine1}</span>
            </div>
          </div>
          <div className="flex items-center mt-1 mb-2">
            <RatingStars rating={business.rating} />
            <span className="ml-2 text-sm font-bold text-gray-600 mr-2">
              {business.rating.toFixed(1)}
            </span>
            <span>
            ({business.reviewCount} {business.reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-1">
            {business.categories.map((category) => (
              <span
                key={category}
                className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium"
              >
                {category}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-1">
            {business.description}..{" "}
            {/* <button className="text-blue-600 hover:underline text-sm">
              more
            </button> */}
          </p>
        </div>
        {!hideButton && (
          <div className="flex flex-row sm:items-center justify-end align-end mt-auto">
            <Button size="sm" className="bg-[#2E57A9]">
              <FaCommentDots /> Write a message
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
