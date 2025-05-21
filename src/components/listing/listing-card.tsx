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
import { PhoneCallIcon } from "lucide-react";

const ListingCard: React.FC<{ business: Business; hideButton?: boolean }> = ({
  business,
  hideButton = false,
}) => {
  const auth = useAuth();
  const {
    data: image,
    isLoading,
    isError,
  } = trpc.getBusinessImage.useQuery({
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
    <div className="container bg-white rounded-xl shadow-xs overflow-hidden flex flex-col md:flex-row p-2 relative h-auto md:h-[17vh] gap-2 listing-card max-h-[15rem]">
      <div className="w-full h-100 md:w-1/3 md:h-full relative">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <>
            <Image
              src={image ? image.imageUrl : "/images/no-image.jpg"}
              alt={business.name}
              fill
              className="rounded-xl bg-gray-200 object-cover"
              style={{
                viewTransitionName: `business-${business.$id}-image`,
                inset: "auto",
              }}
            />
            <div className="absolute inset-0 bg-black opacity-40 md:hidden rounded-xl"></div>{" "}
            {/* Content container for mobile overlay */}
            <div className="absolute inset-0 p-4 flex flex-col justify-between md:hidden">
              {/* Top section: Name, Address, Category, Rating */}
              <div className="flex flex-col">
                <div className="flex flex-wrap justify-between mb-2">
                  {/* Name (Top Left) */}
                  <Link href={`/business/${business.$id}`}>
                    <h3 className="text-md font-semibold text-white">
                      {business.name}
                    </h3>
                  </Link>
                  {/* Address (Top Right) */}
                  <div className="flex items-center text-xs text-white">
                    <FaMapMarkerAlt className="mr-1" />
                    <span className="text-xs">
                      {business.addressLine1}, {business.city}{" "}
                    </span>
                  </div>
                </div>
                {/* Category and Rating */}
                <div className="flex justify-between flex-wrap items-center mt-1">
                  {" "}
                  {/* Added mt-1 for spacing */}
                  {/* Category (Left of Rating) */}
                  <div className="flex flex-wrap gap-1 mr-2">
                    {" "}
                    {/* Added mr-2 for spacing */}
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                      {business.category}
                    </span>
                  </div>
                  {/* Rating */}
                  <div className="flex items-center h-5">
                    <RatingStars rating={business.rating} starSize={12} />{" "}
                    {/* Mobile rating size */}
                    <span className="text-xs font-bold text-white m-2">
                      {" "}
                      {/* Changed text color to white */}
                      {business.rating.toFixed(1)}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {" "}
                      {/* Changed text color to white */}({business.reviewCount}{" "}
                      {business.reviewCount === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                </div>
              </div>
              {/* Call to Action Buttons (Bottom Right within overlay) */}
              <div className="flex flex-col justify-end mt-2 gap-4">
                {/* Description (Bottom Left within overlay) */}
                <p className="text-xs leading-relaxed text-white">
                  {business.about}..{" "}
                </p>
                {/* Added justify-end for right alignment */}
                <div className="flex flex-row justify-between gap-2">
                  {(business.phoneCountryCode || "") +
                    (business.phoneNumber || "") && (
                    <Button
                      className="text-xs text-white"
                      variant="ghost"
                      size="icon"
                    >
                      <Link
                        href={`tel:${
                          (business.phoneCountryCode || "") +
                          (business.phoneNumber || "")
                        }`}
                      >
                        <PhoneCallIcon />
                      </Link>
                    </Button>
                  )}
                  {!hideButton && auth.isAuthenticated && (
                    <Button
                      size="sm"
                      className="bg-primary text-white text-xs"
                      onClick={() =>
                        redirect(`/messages?recipient=${business.ownerId}`)
                      }
                    >
                      <FaCommentDots /> Write a message
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Content for larger screens */}
      <div className="hidden md:flex flex-col justify-between gap-1 md:gap-2">
        <div className="flex p-0 justify-between items-start">
          <Link href={`/business/${business.$id}`}>
            <h3
              className="text-md md:text-xl font-semibold text-gray-800"
              style={{ viewTransitionName: `business-${business.$id}-name` }}
            >
              {business.name}
            </h3>
          </Link>
          <div className="flex items-center text-xs w-30">
            <FaMapMarkerAlt className="mr-1" />
            <span className="text-xs">
              {business.addressLine1}, {business.city}{" "}
            </span>
          </div>
        </div>
        <div className="flex items-center h-5">
          <span className="hidden md:block">
            <RatingStars rating={business.rating} starSize={16} />
          </span>
          <span className="block md:hidden">
            <RatingStars rating={business.rating} starSize={12} />
          </span>
          <span className="text-xs font-bold text-gray-600 m-2">
            {business.rating.toFixed(1)}
          </span>
          <span className="text-xs font-bold text-gray-600">
            ({business.reviewCount}{" "}
            {business.reviewCount === 1 ? "review" : "reviews"})
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
            {business.category}
          </span>
        </div>
        <p className="text-xs leading-relaxed">{business.about}.. </p>
      </div>
    </div>
  );
};

export default ListingCard;
