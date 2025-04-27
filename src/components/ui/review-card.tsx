"use client";
import { useEffect, useState, type ReactNode } from "react";
import { trpc } from "@/lib/trpc/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Star, ThumbsUp, ThumbsDown, Trash2, Pencil } from "lucide-react";
import Loading, { LoadingSVG } from "@/components/ui/loading";
import { Review } from "@/lib/schema";
import { useAuth } from "@/lib/hooks/useClientAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Helper component for star ratings - Moved from page.tsx
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

export const ReviewCard = ({
  review,
  children,
  onReviewDeleted,
  onEditReview,
  onReplyToReview,
}: {
  review: Review;
  children?: ReactNode;
  onReviewDeleted?: () => void;
  onEditReview?: (review: Review) => void;
  onReplyToReview?: (review: Review) => void;
}) => {
  const { data: reviewUser, isLoading } = trpc.getUserById.useQuery({
    userId: review.userId,
  });
  const { user: currentUser, isAuthenticated } = useAuth(); // Get isAuthenticated

  const utils = trpc.useUtils(); // For invalidating queries

  // Fetch replies for this review
  const { data: replies, isLoading: isRepliesLoading } =
    trpc.getReviewReplies.useQuery({ parentReviewId: review.$id });

  // State to track user's current reaction
  const [userReaction, setUserReaction] = useState<"like" | "dislike" | null>(
    null
  );
  // State to track local like/dislike counts
  const [localLikes, setLocalLikes] = useState(review.likes);
  const [localDislikes, setLocalDislikes] = useState(review.dislikes);

  // Fetch user's existing reaction on mount
  const { data: userReactionData, isLoading: isUserReactionLoading } =
    trpc.getUserReaction.useQuery(
      { reviewId: review.$id, userId: currentUser?.$id! },
      {
        enabled: isAuthenticated && !!currentUser?.$id, // Only fetch if authenticated and user ID is available
      }
    );

  const reactMutation = trpc.reactToReview.useMutation({
    onSuccess: (data) => {
      // Update local counts and user reaction based on the response
      setLocalLikes(data.likes);
      setLocalDislikes(data.dislikes);
      setUserReaction(data.userReactionType);
      // Invalidate the reviews query to keep data consistent across components
      utils.getBusinessReviews.invalidate({ businessId: review.businessId });
    },
    onError: (error) => {
      toast.error("Failed to react to review.", {
        description: error.message,
      });
    },
  });

  useEffect(() => {
    console.log(userReactionData)
    setUserReaction(userReactionData?.type || null);
  }, [isUserReactionLoading]);

  const handleReaction = async (type: "like" | "dislike") => {
    if (!isAuthenticated || !currentUser) {
      toast.info("Please sign in to react to reviews.");
      return;
    }

    if (type === "like") {
      setLocalLikes((likes) => likes + 1);
      setLocalDislikes((dislikes) => dislikes - 1);
    } else {
      setLocalLikes((likes) => likes - 1);
      setLocalDislikes((dislikes) => dislikes + 1);
    }

    setUserReaction(type);

    await reactMutation.mutateAsync({
      reviewId: review.$id,
      userId: currentUser.$id,
      type,
    });
  };

  const deleteMutation = trpc.deleteReview.useMutation({
    onSuccess: () => {
      toast.success("Review deleted successfully.");
      onReviewDeleted?.();
    },
    onError: (error) => {
      toast.error("Failed to delete review.", {
        description: error.message,
      });
    },
  });

  const handleDelete = async () => {
    await deleteMutation.mutateAsync({ reviewId: review.$id });
  };

  if (isLoading || isRepliesLoading || !reviewUser)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingSVG />
      </div>
    );

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar>
            {/* TODO: Replace with actual user avatar if available */}
            <AvatarFallback>
              {currentUser?.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            {/* TODO: Replace userId with actual user name */}
            <p className="font-semibold">{reviewUser?.name}</p>
            {/* TODO: Add user location if available */}
            {/* <p className="text-sm text-gray-500">{review}</p> */}

            {/* Icons/Stats - Using Likes/Dislikes as placeholders for image icons */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
              <button
                className={`flex items-center gap-1 ${
                  userReaction === "like" ? "text-blue-600" : ""
                }`}
                onClick={() => handleReaction("like")}
                disabled={reactMutation.status === "pending"}
              >
                <ThumbsUp className="w-3 h-3" /> {localLikes}
              </button>
              <button
                className={`flex items-center gap-1 ${
                  userReaction === "dislike" ? "text-red-600" : ""
                }`}
                onClick={() => handleReaction("dislike")}
                disabled={reactMutation.status === "pending"}
              >
                <ThumbsDown className="w-3 h-3" /> {localDislikes}
              </button>
            </div>
          </div>
          {currentUser?.$id === review.userId && (
            <div className="flex items-center gap-2 ml-auto">
              {onEditReview && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditReview(review)}
                >
                  <Pencil className="w-4 h-4 text-gray-500" />
                </Button>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this review? This action
                      cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleteMutation.status === "pending"}
                    >
                      {deleteMutation.status === "pending"
                        ? "Deleting..."
                        : "Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="">
        {/* Star Rating & Date */}
        <div className="flex items-center gap-2 mb-6">
          <StarRating rating={review.rating} />
          <span className="text-xs text-gray-500">
            {new Date(review.createdAt).toDateString()}
          </span>
        </div>
        {/* Review Text */}
        <div className="text-sm text-gray-700 space-y-3 whitespace-pre-line">
          {review.text.split("\n\n").map((paragraph, pIndex) => (
            <p key={pIndex}>{paragraph}</p>
          ))}
        </div>
        {/* Action buttons (Reply, Edit) */}
        <div className="flex gap-2 mt-4">
          {onReplyToReview && (
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-sm"
              onClick={() => onReplyToReview(review)}
            >
              Reply
            </Button>
          )}
          {children} {/* Render any additional children here */}
        </div>
      </CardContent>
      {/* Render replies recursively */}
      {replies && replies.length > 0 && (
        <div className="ml-8 mt-4 space-y-4"> {/* Add left margin for indentation */}
          {replies.map((reply) => (
            <ReviewCard
              key={reply.$id}
              review={reply}
              onReviewDeleted={onReviewDeleted} // Pass down delete handler
              onEditReview={onEditReview} // Pass down edit handler
              onReplyToReview={onReplyToReview} // Pass down reply handler
              // Replies of replies are not supported in this structure, so no 'replies' prop here
            />
          ))}
        </div>
      )}
    </Card>
  );
};
