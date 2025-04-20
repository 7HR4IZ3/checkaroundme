"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, Star } from "lucide-react"; // Import ArrowRight icon

export default function ReviewForm() {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const minChars = 85;

  const handleRating = (rate: number) => {
    setRating(rate);
  };

  return (
    // Simplified container styling
    <div className="container p-6 mx-auto h-[70vh]">
      <h2 className="text-xl font-semibold my-8">Mobile Mercedes Mechanic</h2>

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
              onClick={() => handleRating(star)}
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
        <Textarea
          id="review-text"
          placeholder="Reply review..." // Updated placeholder
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="min-h-[320px] border-0" // Keep min height, adjust if needed based on visual result
        />
        {/* Character count removed */}
      </div>

      <Button
        // disabled logic removed, assuming button is always enabled or handled elsewhere
        className="w-1/4 rounded-full h-[4em] bg-[#2E57A9]"
        // Add specific styling if needed to match the blue button, e.g., bg-blue-600 text-white hover:bg-blue-700
      >
        REPLY REVIEW
        <ArrowRight className="ml-2 h-4 w-4" /> {/* Use ArrowRight icon */}
      </Button>
    </div>
  );
}
