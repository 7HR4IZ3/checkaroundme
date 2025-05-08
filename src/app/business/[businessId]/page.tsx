"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { useRef, useState, ChangeEvent, useEffect } from "react";
import RatingStars from "@/components/ui/rating-stars"; // Import RatingStars component
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Star,
  CheckCircle,
  Phone,
  MapPin,
  Pencil,
  ImagePlus,
  Share2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
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
import { Separator } from "@/components/ui/separator";
import Loading, { LoadingSVG } from "@/components/ui/loading";
import { useAuth } from "@/lib/hooks/useClientAuth";
import ListingCard from "@/components/listing/listing-card";
import { Review } from "@/lib/schema";
import { ReviewCard } from "@/components/ui/review-card";
import { toast } from "sonner";
import MapPlaceholder from "@/components/map/placeholder";

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

// const ReviewCard = ({ review }: { review: Review }) => {
//   const { data: user, isLoading } = trpc.getUserById.useQuery({
//     userId: review.userId,
//   });

//   const reactions = trpc.reactToReview.useMutation();

//   if (isLoading || !user)
//     return (
//       <div className="w-full h-full flex items-center justify-center">
//         <LoadingSVG />
//       </div>
//     );

//   return (
//     <Card className="border-0 shadow-none">
//       <CardHeader>
//         <div className="flex items-start gap-4">
//           <Avatar>
//             {/* TODO: Replace with actual user avatar if available */}
//             <AvatarFallback>
//               {user.name.substring(0, 2).toUpperCase()}
//             </AvatarFallback>
//           </Avatar>
//           <div className="flex-1">
//             {/* TODO: Replace userId with actual user name */}
//             <p className="font-semibold">{user?.name}</p>
//             {/* TODO: Add user location if available */}
//             {/* <p className="text-sm text-gray-500">{review}</p> */}
//             {/* Icons/Stats - Using Likes/Dislikes as placeholders for image icons */}
//             <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
//               <span className="flex items-center gap-1">
//                 <ThumbsUp className="w-3 h-3" /> {review.likes}
//               </span>
//               <span className="flex items-center gap-1">
//                 <ThumbsDown className="w-3 h-3" /> {review.dislikes}
//               </span>
//             </div>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="">
//         {/* Star Rating & Date */}
//         <div className="flex items-center gap-2 mb-6">
//           <StarRating rating={review.rating} />
//           <span className="text-xs text-gray-500">
//             {new Date(review.createdAt).toDateString()}
//           </span>
//         </div>

//         {/* Review Text */}
//         <div className="text-sm text-gray-700 space-y-3 whitespace-pre-line">
//           {review.text.split("\n\n").map((paragraph, pIndex) => (
//             <p key={pIndex}>{paragraph}</p>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

export default function BusinessPage() {
  const { user, isAuthenticated } = useAuth();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // Renamed for clarity
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullAbout, setShowFullAbout] = useState(false); // State for "About" section truncation
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false); // State for reply modal
  const [isWriteReviewModalOpen, setIsWriteReviewModalOpen] = useState(false); // State for write review modal
  const [reviewToEdit, setReviewToEdit] = useState<Review | null>(null); // State for review being edited
  const [reviewToReply, setReviewToReply] = useState<Review | null>(null); // State for review being replied to
  const [newReviewText, setNewReviewText] = useState(""); // State for new review text
  const [newReviewRating, setNewReviewRating] = useState(0); // State for new review rating
  const router = useRouter();
  const params = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null); // Added ref
  const [isUploading, setIsUploading] = useState(false); // Added state
  const [editReviewText, setEditReviewText] = useState(""); // State for edit modal textarea
  const [editReviewRating, setEditReviewRating] = useState(0); // State for edit modal rating
  const [replyText, setReplyText] = useState(""); // State for reply modal textarea

  // tRPC mutations
  const editReviewMutation = trpc.updateReview.useMutation({
    onSuccess: () => {
      utils.getBusinessReviews.invalidate({ businessId });
      setIsEditModalOpen(false);
      toast.success("Review updated successfully.");
    },
    onError: (error) => {
      toast.error("Failed to update review.", {
        description: error.message,
      });
    },
  });

  const createReviewMutation = trpc.createReview.useMutation({
    onSuccess: () => {
      utils.getBusinessReviews.invalidate({ businessId });
      setIsWriteReviewModalOpen(false);
      setNewReviewText(""); // Clear new review text on success
      setNewReviewRating(0); // Reset rating on success
      toast.success("Review posted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to post review.", {
        description: error.message,
      });
    },
  });

  const replyToReviewMutation = trpc.createReview.useMutation({
    onSuccess: () => {
      utils.getBusinessReviews.invalidate({ businessId });
      setIsReplyModalOpen(false);
      setReplyText(""); // Clear reply text on success
      toast.success("Reply posted successfully.");
    },
    onError: (error) => {
      toast.error("Failed to post reply.", {
        description: error.message,
      });
    },
  });

  const utils = trpc.useUtils(); // For invalidating queries
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
    { enabled: !!businessId },
  );
  const {
    data: hours,
    isLoading: isHoursLoading,
    error: hoursError,
  } = trpc.getBusinessHours.useQuery({ businessId }, { enabled: !!businessId });
  const { data: reviews, isLoading: isReviewsLoading } =
    trpc.getBusinessReviews.useQuery({ businessId }, { enabled: !!businessId });

  const { data: businesses } = trpc.listBusinesses.useQuery({ limit: 5 });

  // Effect to clear edit text and set initial rating when modal opens/closes
  useEffect(() => {
    if (!isEditModalOpen) {
      setEditReviewText("");
      setEditReviewRating(0); // Clear rating when modal closes
      setReviewToEdit(null);
    } else if (reviewToEdit) {
      setEditReviewText(reviewToEdit.text); // Set initial text
      setEditReviewRating(reviewToEdit.rating); // Set initial rating when modal opens
    }
  }, [isEditModalOpen, reviewToEdit]);

  // Effect to clear reply text when modal closes
  useEffect(() => {
    if (!isReplyModalOpen) {
      setReplyText("");
      setReviewToReply(null);
    }
  }, [isReplyModalOpen]);

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

  // Handler for file input change
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !businessId || !isAuthenticated) return;

    setIsUploading(true);
    const formData = new FormData();
    for (let index = 0; index < files.length; index++) {
      const file = files.item(index);
      if (!file) continue;

      formData.append("images", file, file.name);
    }

    formData.append("userID", user.$id);
    formData.append("businessId", businessId); // Add businessId to the form data

    try {
      const response = await fetch("/api/upload/images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // Consider showing an error message to the user
        const errorData = await response
          .json()
          .catch(() => ({ message: "Upload failed" }));
        console.error("Upload failed:", errorData.message);
        throw new Error(errorData.message || "Upload failed");
      }

      // Invalidate the images query to refresh the list
      await utils.getBusinessImages.invalidate({ businessId });
      console.log("Image uploaded successfully!");
      // Optionally show a success message (e.g., using a toast library)
    } catch (error) {
      console.error("Error uploading image:", error);
      // Optionally show an error message to the user
    } finally {
      setIsUploading(false);
      // Reset file input value so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handler for the button click
  const handleAddPhotoClick = () => {
    // Prevent clicking if already uploading
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  // Handlers for edit and reply actions
  const handleEditReview = (review: Review) => {
    setReviewToEdit(review);
    setEditReviewText(review.text); // Set initial text
    setIsEditModalOpen(true);
  };

  const handleReplyToReview = (review: Review) => {
    setReviewToReply(review);
    setIsReplyModalOpen(true);
  };

  // Handlers for modal form submission
  const handleSaveEdit = async () => {
    if (!reviewToEdit || editReviewText.trim() === "") return;
    await editReviewMutation.mutateAsync({
      reviewId: reviewToEdit.$id,
      text: editReviewText,
      rating: editReviewRating, // Include the updated rating
    });
  };

  const handleSendReply = async () => {
    if (!reviewToReply || replyText.trim() === "" || !user || !businessId)
      return;
    await replyToReviewMutation.mutateAsync({
      businessId: businessId,
      userId: user.$id,
      rating: 1,
      text: replyText,
      parentReviewId: reviewToReply.$id,
    });
  };

  // Handler for submitting a new review
  const handleCreateReview = async () => {
    if (
      !user ||
      !businessId ||
      newReviewText.trim() === "" ||
      newReviewRating === 0
    ) {
      toast.info("Please provide a rating and review text.");
      return;
    }
    await createReviewMutation.mutateAsync({
      businessId: businessId,
      userId: user.$id,
      rating: newReviewRating,
      text: newReviewText,
    });
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*" // Accept only image files
          style={{ display: "none" }}
        />
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
                {business.verificationStatus === "verified" && (
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
                    const today = openingHours.find(
                      (h) => h.day === currentDay,
                    );
                    return today ? today.hours : "";
                  })()}
                </span>
                <Button variant="link" className="p-0 h-auto text-sm">
                  <a href="#hours">See hours</a>
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    className="bg-[#2E57A9] text-white"
                    onClick={() => setIsWriteReviewModalOpen(true)}
                  >
                    <Star className="mr-2 h-4 w-4" /> Write a review
                  </Button>
                )}
                {user?.$id === business.ownerId && (
                  <Button
                    variant="outline"
                    onClick={handleAddPhotoClick}
                    disabled={isUploading} // Disable button while uploading
                  >
                    {isUploading ? (
                      <div className="mr-2 h-4 w-4 animate-spin">
                        <LoadingSVG />
                      </div>
                    ) : (
                      <>
                        <ImagePlus className="mr-2 h-4 w-4" /> Add a photo
                      </>
                    )}
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
                {imageUrls.length > 5 && (
                  <Button
                    variant="link"
                    className="text-sm"
                    onClick={() => {
                      setCurrentImageIndex(0);
                      setIsImageModalOpen(true);
                    }}
                  >
                    See all {imageUrls.length} photos{" "}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
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
                      <div
                        className="aspect-square relative bg-muted rounded-md overflow-hidden cursor-pointer"
                        onClick={() => {
                          setCurrentImageIndex(index);
                          setIsImageModalOpen(true);
                        }}
                      >
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
                {business.verificationStatus === "verified" && (
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

            {/* Amenities & Details */}
            <section>
              <h2 className="text-xl font-semibold mb-4">
                Amenities & Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
                {/* Price Indicator */}
                {business.priceIndicator && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium w-28">Price Range:</span>
                    <span>{business.priceIndicator} (Max)</span>
                  </div>
                )}

                {/* Payment Options */}
                {business.paymentOptions &&
                  business.paymentOptions.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium w-28">Accepts:</span>
                      <span>
                        {business.paymentOptions
                          .map((opt) =>
                            opt
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase()),
                          )
                          .join(", ")}
                      </span>
                    </div>
                  )}

                {/* Wifi */}
                {business.wifi && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium w-28">Wifi:</span>
                    <span>Available</span>
                  </div>
                )}

                {/* On-Site Parking */}
                {business.onSiteParking && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium w-28">Parking:</span>
                    <span>On-Site Available</span>
                  </div>
                )}

                {/* Garage Parking */}
                {business.garageParking && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium w-28"></span>{" "}
                    {/* Keep alignment */}
                    <span>Garage Available</span>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* About the Business */}
            <section>
              <h2 className="text-xl font-semibold mb-2">About the Business</h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {business.about.length > 500 && !showFullAbout
                  ? business.about.substring(0, 500) + "..."
                  : business.about}
                {business.about.length > 500 && (
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm ml-1"
                    onClick={() => setShowFullAbout(!showFullAbout)}
                  >
                    {showFullAbout ? "less" : "more"}
                  </Button>
                )}
              </p>
            </section>

            <Separator />

            {/* Location & Hours */}
            <section id="hours">
              <h2 className="text-xl font-semibold mb-4">Location & Hours</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Map Placeholder */}
                <MapPlaceholder />
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
                              : item.day === currentDay &&
                                  item.hours !== "Closed"
                                ? "text-green-600"
                                : ""
                          }
                        >
                          {item.hours}
                          {item.day === currentDay &&
                            item.hours !== "Closed" && (
                              <span className="ml-2 text-green-600">
                                Open now
                              </span>
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
              <h2 className="text-xl font-semibold mb-4">Reviews</h2>
              {/* Overall Rating Summary */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 p-4 rounded-md">
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {business.rating.toFixed(1)}
                  </p>
                  <StarRating rating={business.rating} />
                  <p className="text-sm text-gray-600 mt-1">
                    ({business.reviewCount} reviews)
                  </p>
                </div>
                {isAuthenticated ? (
                  <div className="flex-1 w-full space-y-1">
                    {(() => {
                      // Calculate star distribution
                      const starCounts = [0, 0, 0, 0, 0];
                      reviews?.reviews.forEach((review) => {
                        const stars = Math.round(review.rating);
                        if (stars >= 1 && stars <= 5) {
                          starCounts[stars - 1]++;
                        }
                      });

                      const totalReviews = reviews?.reviews.length || 1;
                      return (
                        <>
                          <RatingBar
                            stars={5}
                            percentage={(starCounts[4] / totalReviews) * 100}
                          />
                          <RatingBar
                            stars={4}
                            percentage={(starCounts[3] / totalReviews) * 100}
                          />
                          <RatingBar
                            stars={3}
                            percentage={(starCounts[2] / totalReviews) * 100}
                          />
                          <RatingBar
                            stars={2}
                            percentage={(starCounts[1] / totalReviews) * 100}
                          />
                          <RatingBar
                            stars={1}
                            percentage={(starCounts[0] / totalReviews) * 100}
                          />
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex-1 w-full flex items-center justify-center">
                    <Button
                      variant="link"
                      onClick={() => router.push("/auth")}
                      className="text-blue-600"
                    >
                      Sign in to see rating distribution
                    </Button>
                  </div>
                )}
              </div>

              {/* Individual Reviews */}
              <div className="space-y-6">
                {reviews?.reviews.map((review, index) => (
                  <ReviewCard
                    review={review}
                    key={index}
                    onReviewDeleted={() =>
                      utils.getBusinessReviews.invalidate({ businessId })
                    }
                    onEditReview={handleEditReview}
                    onReplyToReview={handleReplyToReview}
                  />
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
              <Button
                variant="ghost"
                className="w-full flex justify-end md:justify-between flex-row-reverse md:flex-row"
              >
                <span className="ml-2">{business.phone}</span>{" "}
                <Phone className="h-4 w-4" />
              </Button>
              <div className="flex items-center justify-start flex-col">
                <Button
                  variant="ghost"
                  className="w-full flex justify-end md:justify-between flex-row-reverse md:flex-row"
                >
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

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="md:max-w-[80vw] h-[80vh] bg-white p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-center text-xl">
              Photo {currentImageIndex + 1} of {imageUrls.length}
            </DialogTitle>
          </DialogHeader>
          <div className="relative h-[calc(80vh-100px)] bg-white">
            <Image
              src={imageUrls[currentImageIndex]}
              alt={`Business photo ${currentImageIndex + 1}`}
              fill
              style={{ objectFit: "contain" }}
              className="p-4"
            />
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50"
                disabled={currentImageIndex === 0}
                onClick={() =>
                  setCurrentImageIndex((prev) => Math.max(0, prev - 1))
                }
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50"
                disabled={currentImageIndex === imageUrls.length - 1}
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    Math.min(imageUrls.length - 1, prev + 1),
                  )
                }
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </div>
          </div>

          {/* Image preview gallery */}
          {/* <div className="px-6 pb-6">
            <div className="flex gap-2 overflow-x-auto py-4">
              {imageUrls.map((imgSrc, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 ${
                    currentImageIndex === index
                      ? "border-blue-500"
                      : "border-transparent"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={imgSrc}
                    alt={`Preview ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div> */}
        </DialogContent>
      </Dialog>

      {/* Edit Review Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Interactive Rating Stars for Edit */}
            <div className="grid gap-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 cursor-pointer ${
                      star <= editReviewRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                    onClick={() => setEditReviewRating(star)}
                  />
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editReviewText">Review</Label>
              <Textarea
                id="editReviewText"
                value={editReviewText}
                onChange={(e) => setEditReviewText(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="button" // Changed to type="button" to prevent default form submission
              onClick={handleSaveEdit}
              disabled={editReviewMutation.status === "pending"}
            >
              {editReviewMutation.status === "pending"
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Write Review Modal */}
      <Dialog
        open={isWriteReviewModalOpen}
        onOpenChange={setIsWriteReviewModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newReviewRating">Rating</Label>
              {/* Interactive Rating Stars */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 cursor-pointer ${
                      star <= newReviewRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                    onClick={() => setNewReviewRating(star)}
                  />
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newReviewText">Your Review</Label>
              <Textarea
                id="newReviewText"
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleCreateReview}
              disabled={createReviewMutation.status === "pending"}
            >
              {createReviewMutation.status === "pending"
                ? "Submitting..."
                : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply to Review Modal */}
      <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="replyText">Your Reply</Label>
              <Textarea
                id="replyText"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="button" // Changed to type="button"
              onClick={handleSendReply}
              disabled={replyToReviewMutation.status === "pending"}
            >
              {replyToReviewMutation.status === "pending"
                ? "Sending..."
                : "Send Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
