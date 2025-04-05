import React from "react";
import Image from "next/image";
import { FaMapMarkerAlt, FaCommentDots } from "react-icons/fa";
import RatingStars from "@/components/ui/rating-stars";
import { Button } from "@/components/ui/button"; // Use the reusable button
import Link from "next/link";

interface ListingCardProps {
  imageUrl: string;
  name: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  description: string;
  location: string;
  hideButton?: boolean;
}

const ListingCard: React.FC<ListingCardProps> = ({
  imageUrl,
  name,
  rating,
  reviewCount,
  tags,
  description,
  location,
  hideButton = false
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col sm:flex-row p-2">
        <Image
          src={imageUrl}
          alt={name}
          object-fit="cover"
          height={100} width={130}
          className="rounded-lg bg-gray-200" // Background while loading
        />
      <div className="px-4 flex flex-col justify-between flex-grow">
        <div>
          <Link href="/business">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{name}</h3>
          </Link>
          <div className="flex items-center mb-2">
            <RatingStars rating={rating} />
            <span className="ml-2 text-sm text-gray-600">
              {rating.toFixed(1)} ({reviewCount} reviews)
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-1">
            {description}..{" "}
            <button className="text-blue-600 hover:underline text-sm">
              more
            </button>
          </p>
        </div>
        <div className="flex flex-row sm:items-center justify-between pt-3 align-end mt-auto border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500">
            <FaMapMarkerAlt className="mr-1.5" />
            <span>{location}</span>
          </div>
          {!hideButton && (
            <Button size="sm">
              <FaCommentDots /> Write a message
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;