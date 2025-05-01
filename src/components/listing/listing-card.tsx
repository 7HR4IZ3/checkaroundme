"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";

import { FaMapMarkerAlt, FaCommentDots } from "react-icons/fa";
import RatingStars from "@/components/ui/rating-stars";
import { Button } from "@/components/ui/button"; // Use the reusable button
import { Business } from "@/lib/schema";
import { trpc } from "@/lib/trpc/client";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "@/lib/hooks/useClientAuth";
import { redirect } from "next/navigation";

const ListingCard: React.FC<{ business: Business; hideButton?: boolean }> = ({
  business,
  hideButton = false,
}) => {
  const auth = useAuth();
  const { data: image, isLoading } = trpc.getBusinessImage.useQuery({
    businessId: business.$id,
  });

  // const updateBusinessMutation = trpc.updateBusiness.useMutation();

  // useEffect(() => {
  //   if (!business.coordinates) {
  //     const address = `${business.addressLine1} ${business.city} ${
  //       business.state || ""
  //     } ${business.country || ""} ${business.postalCode || ""}`;
  //     axios
  //       .get("https://nominatim.openstreetmap.org/search", {
  //         params: {
  //           q: address,
  //           format: "json",
  //           limit: 1,
  //         },
  //         headers: {
  //           "User-Agent": "CheckAroundMe/1.0 (contact@checkaroundme.com)", // Replace with your app name and contact
  //         },
  //       })
  //       .then((response) => {
  //         if (response.data && response.data.length > 0) {
  //           const result = response.data[0];
  //           const newCoordinates = {
  //             latitude: parseFloat(result.lat),
  //             longitude: parseFloat(result.lon),
  //           };
  //           console.log(
  //             `Client-side geocoded address "${address}" to`,
  //             newCoordinates
  //           );
  //           // Update the business in the background
  //           updateBusinessMutation.mutate({
  //             businessId: business.$id,
  //             data: {
  //               coordinates: newCoordinates,
  //             },
  //           });
  //         } else {
  //           console.warn(
  //             `Client-side geocoding failed for address: "${address}". No results found.`
  //           );
  //         }
  //       })
  //       .catch((error) => {
  //         console.error("Client-side geocoding error:", error);
  //       });
  //   }
  // }, [business]);

  return (
    <div className="h-[18em] bg-white rounded-lg shadow-xs overflow-hidden flex flex-row p-2 relative">
      <div className="w-[20em] m:w-1/2 relative">
        {isLoading || !image ? (
          <Skeleton />
        ) : (
          <Image
            src={image.imageUrl}
            alt={business.name}
            object-fit="cover"
            fill
            className="rounded-xl bg-gray-200" // Background while loading
          />
        )}
      </div>
      <div className="flex-grow px-4 py-4 flex flex-col justify-between">
        <div className="flex flex-col justify-between">
          <div className="flex p-0 justify-between items-start">
            <Link href={`/business/${business.$id}`}>
              <h3 className="text-lg font-semibold text-gray-800">
                {business.name}
              </h3>
            </Link>
            <div className="flex items-center text-xs w-30">
              <FaMapMarkerAlt className="mr-1.5" />
              <span>
                {business.addressLine1},{" "}
                {business.city},{" "}
                {/* {business.state ? business.state + ", " : ""} */}
                {business.country}
              </span>
            </div>
          </div>
          <div className="flex items-center mt-1 mb-2">
            <RatingStars rating={business.rating} />
            <span className="ml-2 text-sm font-bold text-gray-600 mr-2">
              {business.rating.toFixed(1)}
            </span>
            <span>
              ({business.reviewCount}{" "}
              {business.reviewCount === 1 ? "review" : "reviews"})
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
          <p className="text-sm leading-relaxed mb-1">
            {business.about}..{" "}
            {/* <button className="text-blue-600 hover:underline text-sm">
              more
            </button> */}
          </p>
        </div>
        {!hideButton && auth.isAuthenticated && (
          <div className="flex flex-row sm:items-center justify-end align-end mt-auto">
            <Button size="sm" className="bg-[#2E57A9]" onClick={() => redirect(`/messages?recipient=${business.ownerId}`)}>
              <FaCommentDots /> Write a message
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
