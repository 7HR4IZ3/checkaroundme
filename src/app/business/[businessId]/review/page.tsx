"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, Star } from "lucide-react"; // Import ArrowRight icon
import { redirect, useParams } from "next/navigation";
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

  const review = trpc.createReview.useMutation();
  const { data: business, isLoading } = trpc.getBusinessById.useQuery({
    businessId,
  });

  if (isLoading) {
    return <Loading />;
  }


  const handlePostReview = async () => {
    // Add proper errors to UI
    if (!rating) return;
    if (!reviewText || reviewText.length < 85) return;

    setLoading(true);

    await review.mutateAsync({
      businessId,
      rating,
      text: reviewText,
      userId: user.$id,
    });

    redirect(`/business/${businessId}`);
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
              onClick={() => setRating(star)}
              aria-label={`Rate ${star} out of 5 stars`}
              className="bg-white hover:bg-white border-0"
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
            onChange={(e) => setReviewText(e.target.value)}
            className="min-h-[320px] border-0" // Keep min height, adjust if needed based on visual result
            minLength={85}
          />
          <div className={`absolute bottom-2 right-2 text-xs ${reviewText.length < 85 ? 'text-red-500' : 'text-muted-foreground'}`}>
            {reviewText.length}/85
          </div>
        </div>
      </div>

      <Button
        // disabled logic removed, assuming button is always enabled or handled elsewhere
        className="w-1/4 rounded-full h-[4em] bg-[#2E57A9]"
        disabled={loading || reviewText.length < 85 || !rating}
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
