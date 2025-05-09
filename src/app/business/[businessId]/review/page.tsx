"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, Star } from "lucide-react"; // Import ArrowRight icon
import { redirect, useParams } from "next/navigation";
import { toast } from "sonner"; // Import toast
import { trpc } from "@/lib/trpc/client";
import Loading, { LoadingSVG } from "@/components/ui/loading";
import { useAuth } from "@/lib/hooks/useClientAuth";

export default function ReviewForm() {
  const params = useParams();
  const { user, isAuthenticated } = useAuth();

  const businessId = params.businessId as string;
  if (!isAuthenticated || !businessId) {
    return redirect("/");
  }

  const [loading, setLoading] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState<number | null>(null);

  const [ratingError, setRatingError] = useState("");
  const [reviewTextError, setReviewTextError] = useState("");

  const review = trpc.createReview.useMutation();
  const { data: business, isLoading } = trpc.getBusinessById.useQuery({
    businessId,
  });

  if (isLoading) {
    return <Loading />;
  }

  const handlePostReview = async () => {
    setRatingError("");
    setReviewTextError("");

    if (!rating) {
      setRatingError("Please select a rating.");
      return;
    }

    setLoading(true);

    try {
      await review.mutateAsync({
        businessId,
        rating,
        text: reviewText,
        userId: user.$id,
      });

      redirect(`/business/${businessId}`);
    } catch (error: any) {
      console.error("Review submission error:", error);
      if (error.data?.httpStatus === 400) {
        const errors = JSON.parse(error.message);

        for (const item of errors) {
          if (item.path[0] === "rating") {
            setRatingError(item.message);
          } else if (item.path[0] === "text") {
            setReviewTextError(item.message);
          }
        }
      } else {
        toast.error("Review Submission Failed", {
          description: error.message || "An unexpected error occurred.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Simplified container styling
    <div className="container p-6 mx-auto h-[70vh]">
      <h2 className="text-xl font-semibold my-8">{business?.name}</h2>

      {/* Rating section */}
      <div className="mb-4">
        <Label className="block text-sm font-medium mb-2">
          Select your rating
        </Label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Button
              key={star}
              variant={rating && rating >= star ? "default" : "outline"}
              size="icon"
              onClick={() => {
                setRating(star);
                setRatingError("");
              }}
              aria-label={`Rate ${star} out of 5 stars`}
              className={`bg-white hover:bg-white border-0 ${
                ratingError ? "border-red-500" : ""
              }`}
            >
              <Star
                className={`h-5 w-5 ${
                  rating && rating >= star
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
          ))}
        </div>
        {ratingError && (
          <p className="text-red-500 text-sm mt-1">{ratingError}</p>
        )}
      </div>

      <div className="mb-4 p-4 border border-2 rounded-lg">
        {/* Added border and padding to match image */}
        <p className="text-sm font-medium mb-2">
          A few things to consider in your review
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Updated prompt text */}
          <span className="text-xs px-2 py-1 bg-secondary rounded">
            Respectful reply
          </span>
          <span className="text-xs px-2 py-1 bg-secondary rounded">
            Quality
          </span>
          <span className="text-xs px-2 py-1 bg-secondary rounded">Value</span>
        </div>
        {/* Label removed, placeholder updated */}
        <div className="relative">
          <Textarea
            id="review-text"
            placeholder="Reply review..." // Updated placeholder
            value={reviewText}
            onChange={(e) => {
              setReviewText(e.target.value);
              setReviewTextError("");
            }}
            className={`min-h-[320px] border-0 ${
              reviewTextError ? "border-red-500" : ""
            }`} // Keep min height, adjust if needed based on visual result
            minLength={85}
          />
          {/* <div className={`absolute bottom-2 right-2 text-xs ${reviewText.length < 85 ? 'text-red-500' : 'text-muted-foreground'}`}>
            {reviewText.length}/85
          </div> */}
        </div>
        {reviewTextError && (
          <p className="text-red-500 text-sm mt-1">{reviewTextError}</p>
        )}
      </div>

      <Button
        // disabled logic removed, assuming button is always enabled or handled elsewhere
        className="w-1/4 rounded-full h-[4em] bg-primary"
        disabled={loading || !rating}
        onClick={handlePostReview}
      >
        {loading ? (
          <>
            Posting Review...
            <LoadingSVG />
          </>
        ) : (
          <>
            Post Review
            <ArrowRight
              className="ml-2 h-4 w-4"
              style={{ transform: "rotate(-45deg)" }}
            />
          </>
        )}
      </Button>
    </div>
  );
}
