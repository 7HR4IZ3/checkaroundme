"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import {
  Star,
  CheckCircle,
  Phone,
  MapPin,
  Pencil,
  ImagePlus,
  Share2,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/ui/loading";
import { useAuth } from "@/lib/hooks/useClientAuth";
import ListingCard from "@/components/listing/listing-card";

// Helper component for star ratings
const StarRating = ({ rating, count }: { rating: number; count?: number }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5; // Adjust if you need half stars
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />
      ))}
      {/* Add half star logic if needed */}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      ))}
      {count !== undefined && (
        <span className="ml-1 text-sm text-gray-600">({count} reviews)</span>
      )}
    </div>
  );
};

// Helper for Rating Breakdown Bars
const RatingBar = ({
  stars,
  percentage,
}: {
  stars: number;
  percentage: number;
}) => (
  <div className="flex items-center gap-2 text-xs">
    <span className="w-10 text-right">
      {stars} star{stars > 1 ? "s" : ""}
    </span>
    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className="bg-yellow-400 h-2 rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
    {/* <span className="w-8 text-left">{percentage}%</span> Optional percentage text */}
  </div>
);

export default function BusinessPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const businessId =
    typeof params.businessId === "string"
      ? params.businessId
      : Array.isArray(params.businessId)
      ? params.businessId[0]
      : "";

  // tRPC queries
  const {
    data: business,
    isLoading: isBusinessLoading,
    error: businessError,
  } = trpc.getBusinessById.useQuery({ businessId }, { enabled: !!businessId });
  const {
    data: images,
    isLoading: isImagesLoading,
    error: imagesError,
  } = trpc.getBusinessImages.useQuery(
    { businessId },
    { enabled: !!businessId }
  );
  const {
    data: hours,
    isLoading: isHoursLoading,
    error: hoursError,
  } = trpc.getBusinessHours.useQuery({ businessId }, { enabled: !!businessId });
  const { data: reviews, isLoading: isReviewsLoading } =
    trpc.getBusinessReviews.useQuery({ businessId }, { enabled: !!businessId });

  const { data: businesses } = trpc.listBusinesses.useQuery({ limit: 5 });

  // Loading and error states
  if (isBusinessLoading || isImagesLoading || isHoursLoading) {
    return <Loading />;
  }
  if (businessError || imagesError || hoursError) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading business information.
      </div>
    );
  }
  if (!business) {
    return (
      <div className="p-8 text-center text-gray-600">Business not found.</div>
    );
  }

  // Map images to array of URLs
  const imageUrls = images?.map((img) => img.imageUrl) ?? [];

  // Map hours to array of { day, hours }
  const openingHours =
    hours?.map((h) => ({
      day: h.day,
      hours: h.isClosed
        ? "Closed"
        : `${h.openTime ?? ""} - ${h.closeTime ?? ""}`,
    })) ?? [];

  // Get current day for opening hours highlight
  const currentDay = new Date().toLocaleDateString("en-US", {
    weekday: "short",
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {" "}
      {/* Main container */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Left Column */}
        <div className="md:flex-grow space-y-8">
          {/* Business Info */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{business.name}</h1>
              {user?.$id === business.ownerId && (
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-2 flex items-center gap-1"
                  onClick={() => router.push(`/business/${businessId}/edit`)}
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit Business
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-yellow-500">
                  {business.rating.toFixed(1)}
                </span>
                <StarRating
                  rating={business.rating}
                  count={business.reviewCount}
                />
              </div>
            </div>
            <div className="flex items-center gap-1 mb-2 text-sm">
              {business.isVerified && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified</span>
                </div>
              )}
              {business.categories.map((cat) => (
                <Badge key={cat} variant="outline">
                  {cat}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm mb-4">
              {/* Compute isOpen and hoursToday from openingHours */}
              {(() => {
                const today = openingHours.find((h) => h.day === currentDay);
                if (!today) return null;
                if (today.hours === "Closed") {
                  return (
                    <span className="text-red-600 font-semibold">Closed</span>
                  );
                }
                return (
                  <span className="text-green-600 font-semibold">Open</span>
                );
              })()}
              <span>
                {(() => {
                  const today = openingHours.find((h) => h.day === currentDay);
                  return today ? today.hours : "";
                })()}
              </span>
              <Button variant="link" className="p-0 h-auto text-sm">
                See hours
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="bg-[#2E57A9] text-white">
                <Star className="mr-2 h-4 w-4" /> Write a review
              </Button>
              {user?.$id === business.ownerId && (
                <Button variant="outline">
                  <ImagePlus className="mr-2 h-4 w-4" /> Add a photo
                </Button>
              )}
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>
          </section>

          <Separator />

          {/* Photos & Videos */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Photos & Videos</h2>
              <Button variant="link" className="text-sm">
                See all {imageUrls.length} photos{" "}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {imageUrls.map((imgSrc, index) => (
                  <CarouselItem
                    key={index}
                    className="basis-1/2 sm:basis-1/3 lg:basis-1/4"
                  >
                    <div className="aspect-square relative bg-muted rounded-md overflow-hidden">
                      {/* Use next/image for optimized images */}
                      <Image
                        src={imgSrc}
                        alt={`Business photo ${index + 1}`}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={index < 3}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
            </Carousel>
          </section>

          <Separator />

          {/* Service Offered */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">Service Offered</h2>
              {business.isVerified && (
                <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  <span>Verified Business</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
              {(business.services ?? []).map((service) => (
                <p key={service}>{service}</p>
              ))}
            </div>
          </section>

          <Separator />

          {/* About the Business */}
          <section>
            <h2 className="text-xl font-semibold mb-2">About the Business</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {business.about}
              <Button variant="link" className="p-0 h-auto text-sm ml-1">
                more
              </Button>
            </p>
          </section>

          <Separator />

          {/* Location & Hours */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Location & Hours</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Map Placeholder */}
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center text-gray-500">
                {/* In a real app, embed a map here (e.g., Google Maps, Mapbox) */}
                Map Placeholder
              </div>
              {/* Address & Hours */}
              <div>
                <p className="font-medium mb-1">{business.addressLine1}</p>
                <p className="text-sm text-gray-600 mb-4">
                  {business.addressLine2}
                </p>

                <div className="space-y-1 text-sm">
                  {openingHours.map((item) => (
                    <div
                      key={item.day}
                      className={`flex justify-between ${
                        item.day === currentDay ? "font-semibold" : ""
                      }`}
                    >
                      <span>{item.day}</span>
                      <span
                        className={
                          item.hours === "Closed"
                            ? "text-red-600"
                            : item.day === currentDay && item.hours !== "Closed"
                            ? "text-green-600"
                            : ""
                        }
                      >
                        {item.hours}
                        {item.day === currentDay && item.hours !== "Closed" && (
                          <span className="ml-2 text-green-600">Open now</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Recommended Reviews */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Recommended reviews</h2>
            {/* Overall Rating Summary */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 p-4 border rounded-md">
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {business.rating.toFixed(1)}
                </p>
                <StarRating rating={business.rating} />
                <p className="text-sm text-gray-600 mt-1">
                  ({business.reviewCount} reviews)
                </p>
              </div>
              <div className="flex-1 w-full space-y-1">
                {/* Add actual percentages based on review distribution */}
                <RatingBar stars={5} percentage={100} />
                <RatingBar stars={4} percentage={60} />
                <RatingBar stars={3} percentage={0} />
                <RatingBar stars={2} percentage={0} />
                <RatingBar stars={1} percentage={0} />
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-6">
              {reviews?.reviews.map((review, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar>
                        {/* <AvatarImage src={review.avatar} alt={review.author} /> */}
                        <AvatarFallback>{review.userId}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        {/* <p className="font-semibold">{review.author}</p>
                        <p className="text-sm text-gray-500">
                          {review.location}
                        </p> */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            {" "}
                            <ThumbsUp className="w-3 h-3" /> {review.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            {" "}
                            <ThumbsDown className="w-3 h-3" /> {review.dislikes}
                          </span>
                          <span>·</span>
                          <span>{review.createdAt.toDateString()}</span>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {review.title && (
                      <p className="font-semibold">{review.title}</p>
                    )}
                    {/* Handle potential newlines in review text */}
                    <div className="text-sm text-gray-700 space-y-2 whitespace-pre-line">
                      {review.text.split("\n\n").map((paragraph, pIndex) => (
                        <p key={pIndex}>{paragraph}</p>
                      ))}
                    </div>
                    {review.recommendation && (
                      <p className="text-sm font-semibold text-gray-800 mt-3">
                        {review.recommendation}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Add "Load More Reviews" button if needed */}
          </section>
        </div>

        {/* Right Column */}
        <div className="md:w-1/3 space-y-6">
          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full flex justify-end md:justify-between flex-row-reverse md:flex-row"
              size="lg"
              onClick={() => router.push("/messages")}
            >
              Message business <MessageSquare className="mr-2 h-4 w-4" />
            </Button>
            <Button variant="ghost" className="w-full flex justify-end md:justify-between flex-row-reverse md:flex-row">
              <span className="ml-2 hidden sm:inline">{business.phone}</span>{" "}
              <Phone className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-start flex-col">
              <Button variant="ghost" className="w-full flex justify-end md:justify-between flex-row-reverse md:flex-row">
                <span className="ml-2 hidden sm:inline">Get Directions</span>{" "}
                <MapPin className="h-4 w-4" />
              </Button>
              <p className="text-sm font-medium">{business.addressLine1}</p>
              <p className="text-sm text-gray-600">{business.addressLine2}</p>
            </div>
          </div>
        </div>
      </div>
      <Separator className="my-12" />
      {/* People also viewed */}
      <section>
        <h2 className="text-xl font-semibold mb-6">People also viewed</h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {businesses?.businesses.map((business) => (
              <CarouselItem
                key={business.$id}
                className="basis-1/1 md:basis-1/2"
              >
                <ListingCard hideButton={true} business={business} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
        </Carousel>
      </section>
    </div>
  );
}
