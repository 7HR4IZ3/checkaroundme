"use client";

import Image from "next/image";
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
  const router = useRouter();
  const businessData = {
    name: "Mobile Mercedes Mechanic",
    rating: 5.0,
    reviewCount: 7,
    isVerified: true,
    categories: ["Garage", "Mobile"],
    isOpen: true,
    hoursToday: "9:00 AM - 6:00 PM",
    phone: "234 784 4398",
    addressLine1: "10 Greenfield Industrial Estate",
    addressLine2: "Bradfield Road Lagos",
    // Dummy Images - replace with actual URLs or paths
    images: [
      "/images/cat-placeholder.png",
      "/images/cat-placeholder.png",
      "/images/cat-placeholder.png",
      "/images/cat-placeholder.png",
      "/images/cat-placeholder.png",
      "/images/cat-placeholder.png",
      "/images/cat-placeholder.png",
    ],
    services: [
      "Bumper repair",
      "Dent removal",
      "Auto frame testing",
      "Auto maintenance",
      "Auto wheel alignment",
      "Auto repairs",
      "Auto steering and suspension repair",
      "Auto wheel and tire repair",
      "Routine automotive maintenance",
      "Rear-end damage",
      "Wheel alignment",
    ],
    about:
      "wheel alignment wheel balancing tyres tyre repairs tyre fitting car accident repairs car spraying dent removal car scratch repairs car restoration bumper repairs alloy wheel repairs alloy wheel refurbishment car diagnostics commercial vehicle repairs welding...",
    openingHours: [
      { day: "Mon", hours: "9:00 AM - 6:00 PM" },
      { day: "Tue", hours: "9:00 AM - 6:00 PM" },
      { day: "Wed", hours: "9:00 AM - 6:00 PM" },
      { day: "Thu", hours: "9:00 AM - 6:00 PM" },
      { day: "Fri", hours: "9:00 AM - 6:00 PM" },
      { day: "Sat", hours: "9:00 AM - 6:00 PM" },
      { day: "Sun", hours: "Closed" },
    ],
    reviews: [
      {
        author: "Juhani M.",
        location: "Custom House, Lagos",
        avatar: "/placeholder-avatar1.jpg", // Replace with actual URL
        likes: 8,
        dislikes: 3,
        date: "10 March 2025", // Use actual dates
        rating: 5,
        title: "", // Optional title if reviews have them
        text: "At first, I was sceptical about everything. I googled for a body repair service and I found VG Car Cosmetic Salon and let me tell you, I have never been more satisfied with a service before then with this company.\n\nThe service was top notch, the result was amazing!!! I highly recommend this company and the price was so affordable. I booked in my Fiat 500 on Wednesday morning with a deep scratch on the passenger side. Everything was all fixed by Friday morning and I could not stop give praise and say thank you to the man.",
        recommendation: "HIGHLY RECOMMEND THIS PLACE!!!",
      },
      {
        author: "Juhani M.",
        location: "Custom House, Lagos",
        avatar: "/placeholder-avatar1.jpg", // Replace with actual URL
        likes: 8,
        dislikes: 3,
        date: "10 March 2025", // Use actual dates
        rating: 5,
        title: "Well we're do I start,",
        text: "I cannot complain with the quality which was done on my car. From start to finish the customer service was excellent and kept me in the loop of what was going on with my car. I had a appointment for an which I was even late for due to my car not starting, but the garage went that extra mile to help me by providing me with some jump leads, which they didn't even need to do.\n\nThe price quoted was reasonable as well and I was surprise when I actually got my car and saw the work. Defoe would recommend them to anyone looking for bodywork.\n\nEven they wash the car as well...",
        recommendation: null,
      },
    ],
    peopleAlsoViewed: [
      {
        name: "BodyTEC",
        rating: 5,
        category: "Garage, Body shops",
        image: "/images/service-placeholder.png",
      },
      {
        name: "BodyTEC",
        rating: 5,
        category: "Garage, Body shops",
        image: "/images/service-placeholder.png",
      },
      {
        name: "BodyTEC",
        rating: 5,
        category: "Garage, Body shops",
        image: "/images/service-placeholder.png",
      },
      {
        name: "BodyTEC",
        rating: 5,
        category: "Garage, Body shops",
        image: "/images/service-placeholder.png",
      },
      {
        name: "BodyTEC",
        rating: 5,
        category: "Garage, Body shops",
        image: "/images/service-placeholder.png",
      },
    ],
  };

  // Get current day for opening hours highlight
  const currentDay = new Date().toLocaleDateString("en-US", {
    weekday: "short",
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {" "}
      {/* Main container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-8">
          {/* Business Info */}
          <section>
            <h1 className="text-3xl font-bold mb-2">{businessData.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-yellow-500">
                  {businessData.rating.toFixed(1)}
                </span>
                <StarRating
                  rating={businessData.rating}
                  count={businessData.reviewCount}
                />
              </div>
            </div>
            <div className="flex items-center gap-1 mb-2 text-sm">
              {businessData.isVerified && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified</span>
                </div>
              )}
              {businessData.categories.map((cat) => (
                <Badge key={cat} variant="outline">
                  {cat}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm mb-4">
              {businessData.isOpen ? (
                <span className="text-green-600 font-semibold">Open</span>
              ) : (
                <span className="text-red-600 font-semibold">Closed</span>
              )}
              <span>{businessData.hoursToday}</span>
              <Button variant="link" className="p-0 h-auto text-sm">
                See hours
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="bg-[#2E57A9] text-white">
                <Star className="mr-2 h-4 w-4" /> Write a review
              </Button>
              <Button variant="outline">
                <ImagePlus className="mr-2 h-4 w-4" /> Add a photo
              </Button>
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
                See all {businessData.images.length} photos{" "}
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
                {businessData.images.map((imgSrc, index) => (
                  <CarouselItem
                    key={index}
                    className="basis-1/2 sm:basis-1/3 lg:basis-1/4"
                  >
                    <div className="aspect-square relative bg-muted rounded-md overflow-hidden">
                      {/* Use next/image for optimized images */}
                      <Image
                        src={imgSrc} // Replace with actual image source
                        alt={`Business photo ${index + 1}`}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={index < 3} // Prioritize loading first few images
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
              {businessData.isVerified && (
                <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  <span>Verified Business</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
              {businessData.services.map((service) => (
                <p key={service}>{service}</p>
              ))}
            </div>
          </section>

          <Separator />

          {/* About the Business */}
          <section>
            <h2 className="text-xl font-semibold mb-2">About the Business</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {businessData.about}
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
                <p className="font-medium mb-1">{businessData.addressLine1}</p>
                <p className="text-sm text-gray-600 mb-4">
                  {businessData.addressLine2}
                </p>

                <div className="space-y-1 text-sm">
                  {businessData.openingHours.map((item) => (
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
                            : item.day === currentDay && businessData.isOpen
                            ? "text-green-600"
                            : ""
                        }
                      >
                        {item.hours}
                        {item.day === currentDay && businessData.isOpen && (
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
                  {businessData.rating.toFixed(1)}
                </p>
                <StarRating rating={businessData.rating} />
                <p className="text-sm text-gray-600 mt-1">
                  ({businessData.reviewCount} reviews)
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
              {businessData.reviews.map((review, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={review.avatar} alt={review.author} />
                        <AvatarFallback>
                          {review.author.substring(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{review.author}</p>
                        <p className="text-sm text-gray-500">
                          {review.location}
                        </p>
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
                          <span>{review.date}</span>
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
        <div className="md:col-span-1 space-y-6">
          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between bg-[]"
              size="lg"
              onClick={() => router.push("/messages")}
            >
              Message business <MessageSquare className="mr-2 h-4 w-4" />
            </Button>
            <Button variant="ghost" className="w-full justify-between">
              <span className="ml-2 hidden sm:inline">
                {businessData.phone}
              </span>{" "}
              <Phone className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-start flex-col">
              <Button variant="ghost" className="w-full justify-between">
                <span className="ml-2 hidden sm:inline">Get Directions</span>{" "}
                <MapPin className="h-4 w-4" />
              </Button>
              <p className="text-sm font-medium">{businessData.addressLine1}</p>
              <p className="text-sm text-gray-600">
                {businessData.addressLine2}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Separator className="my-12" />
      {/* People also viewed */}
      <section>
        <h2 className="text-xl font-semibold mb-6">People also viewed</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {businessData.peopleAlsoViewed.map((item, index) => (
            <Card
              key={index}
              className="overflow-hidden p-2 text-sm" // reduce overall padding + font size
            >
              <CardContent className="p-0">
                <div className="p-1">
                  {" "}
                  {/* smaller image padding */}
                  <div className="relative w-full aspect-square bg-muted rounded-md overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                  </div>
                </div>
                <div className="p-2">
                  {" "}
                  {/* smaller content padding */}
                  <p className="font-semibold text-xs truncate">{item.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <StarRating rating={item.rating} />
                  </div>
                  <Badge
                    variant="secondary"
                    className="mt-1 text-[11px] py-0.5 px-1.5"
                  >
                    {item.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
