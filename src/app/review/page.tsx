"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Send } from "lucide-react"; // Import Send icon

export default function ReviewForm() {
  const [rating, setRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const minChars = 85;

  const handleRating = (rate: number) => {
    setRating(rate);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 border rounded-lg shadow-sm bg-card text-card-foreground">
      <h2 className="text-xl font-semibold mb-4">Mobile Mercedes Mechanic</h2>

      <div className="mb-4">
        <Label className="block text-sm font-medium mb-2">Select your rating</Label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Button
              key={star}
              variant={rating && rating >= star ? "default" : "outline"}
              size="icon"
              onClick={() => handleRating(star)}
              aria-label={`Rate ${star} out of 5 stars`}
            >
              <Star
                className={`h-5 w-5 ${
                  rating && rating >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                }`}
              />
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium mb-2">A few things to consider in your review</p>
        <div className="flex flex-wrap gap-2">
            {/* These seem like prompts, not interactive elements in the design */}
            <span className="text-xs px-2 py-1 bg-secondary rounded">Service Requested</span>
            <span className="text-xs px-2 py-1 bg-secondary rounded">Quality</span>
            <span className="text-xs px-2 py-1 bg-secondary rounded">Value</span>
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor="review-text" className="block text-sm font-medium mb-2">
          Start your review...
        </Label>
        <Textarea
          id="review-text"
          placeholder="Share details of your own experience at this place"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="min-h-[120px]"
        />
        <p className={`text-sm mt-2 ${reviewText.length < minChars ? 'text-destructive' : 'text-muted-foreground'}`}>
          Reviews need to be at least {minChars} characters ({reviewText.length}/{minChars})
        </p>
      </div>

      <Button
        disabled={!rating || reviewText.length < minChars}
        className="w-full sm:w-auto"
      >
        Post Review
        <Send className="ml-2 h-4 w-4" /> {/* Added Send icon */}
      </Button>
    </div>
  );
}