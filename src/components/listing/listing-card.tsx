"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { FaMapMarkerAlt, FaCommentDots } from "react-icons/fa";
import RatingStars from "@/components/ui/rating-stars";
import { Button } from "@/components/ui/button"; // Use the reusable button
import { Business } from "@/lib/schema";
import { trpc } from "@/lib/trpc/client";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "@/lib/hooks/useClientAuth";
import { redirect, useRouter } from "next/navigation";
import { PhoneCallIcon } from "lucide-react";

const ListingCard: React.FC<{ business: Business; hideButton?: boolean }> = ({
  business,
  hideButton = false,
}) => {
  const auth = useAuth();
  const router = useRouter();
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
    <div className="container bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row relative gap-4 h-auto">
      <div className="relative w-full aspect-video md:aspect-auto md:w-48 shrink-0">
        {isLoading ? (
          <Skeleton className="w-full h-full rounded-lg" />
        ) : (
          <>
            <Image
              src={image ? image.imageUrl : "/images/no-image.jpg"}
              alt={business.name}
              fill
              className="rounded-lg bg-gray-200 object-cover"
              style={{
                viewTransitionName: `business-${business.$id}-image`,
                inset: "auto",
              }}
              onClick={() => router.push(`/business/${business.$id}`)}
            />
            <div className="absolute inset-0 bg-black opacity-40 md:hidden rounded-xl"></div>{" "}
            {/* Content container for mobile overlay */}
            <div className="absolute inset-0 p-4 flex flex-col justify-between md:hidden">
              {/* Top section: Name, Address, Category, Rating */}
              <div className="flex flex-col">
                <div className="flex flex-wrap justify-between mb-2">
                  {/* Name (Top Left) */}
                  <Link href={`/business/${business.$id}`}>
                    <h3 className="text-lg font-semibold text-white">
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
                  {business.about.length <= 100
                    ? business.about
                    : `${business.about.substring(0, 100)}...`}
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

      {/* Desktop content */}
      <div className="hidden md:flex flex-1 flex-col gap-6">
        {/* Main info column */}
        <div className="flex flex-col flex-1 gap-3 py-2">
          <div className="flex justify-between items-start gap-4">
            <Link href={`/business/${business.$id}`} className="shrink-0">
              <h3
                className="text-xl font-semibold text-gray-900 hover:text-primary transition-colors"
                style={{ viewTransitionName: `business-${business.$id}-name` }}
              >
                {business.name}
              </h3>
            </Link>
            <div className="flex items-center text-sm text-gray-600 shrink-0">
              <FaMapMarkerAlt className="mr-1.5" />
              <span>
                {business.addressLine1}, {business.city}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              {business.category}
            </span>
            <div className="flex items-center h-5">
              <RatingStars rating={business.rating} starSize={16} />
              <span className="text-sm font-medium text-gray-700 ml-2">
                {business.rating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                ({business.reviewCount}{" "}
                {business.reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-gray-600 line-clamp-2">
            {business.about.length <= 100
              ? business.about
              : `${business.about.substring(0, 100)}...`}
          </p>
        </div>

        {/* Actions column */}
        <div className="flex flex-row items-end gap-3 pl-6 border-l border-gray-100">
          {(business.phoneCountryCode || "") + (business.phoneNumber || "") && (
            <Button
              className="text-primary hover:text-primary/80"
              variant="ghost"
              size="icon"
            >
              <Link
                href={`tel:${
                  (business.phoneCountryCode || "") +
                  (business.phoneNumber || "")
                }`}
              >
                <PhoneCallIcon className="h-5 w-5" />
              </Link>
            </Button>
          )}
          {!hideButton && auth.isAuthenticated && (
            <Button
              size="sm"
              className="bg-primary text-white hover:bg-primary/90"
              onClick={() =>
                redirect(`/messages?recipient=${business.ownerId}`)
              }
            >
              <FaCommentDots className="mr-2" /> Message
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
