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
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col sm:flex-row p-2">
      <Image
        src={image?.imageUrl!}
        alt={business.name}
        object-fit="cover"
        height={100}
        width={130}
        className="rounded-lg bg-gray-200" // Background while loading
      />
      <div className="px-4 flex flex-col justify-between flex-grow">
        <div>
          <Link href={`/business/${business.$id}`}>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {business.name}
            </h3>
          </Link>
          <div className="flex items-center mb-2">
            <RatingStars rating={business.rating} />
            <span className="ml-2 text-sm text-gray-600">
              {business.rating.toFixed(1)} ({business.reviewCount} reviews)
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
            <button className="text-blue-600 hover:underline text-sm">
              more
            </button>
          </p>
        </div>
        <div className="flex flex-row sm:items-center justify-between pt-3 align-end mt-auto border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500">
            <FaMapMarkerAlt className="mr-1.5" />
            <span>{business.addressLine1}</span>
          </div>
          {!hideButton && (
            <Button size="sm" className="bg-[#2E57A9]">
              <FaCommentDots /> Write a message
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
