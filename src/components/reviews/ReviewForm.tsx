
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface ReviewFormProps {
  placeId: string;
  onAddReview: (review: { placeId: string; rating: number; comment: string }) => void;
  onCancel: () => void;
}

export function ReviewForm({ placeId, onAddReview, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      return; // Require at least 1 star
    }
    
    setIsSubmitting(true);
    
    try {
      await onAddReview({
        placeId,
        rating,
        comment
      });
      
      // Reset form
      setRating(0);
      setComment("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Your Rating</label>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 focus:outline-none"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              <Star 
                className={`h-6 w-6 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400" 
                    : "text-gray-300"
                } transition-colors`}
              />
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="comment" className="block text-sm font-medium">Your Review</label>
        <Textarea
          id="comment"
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[100px]"
          required
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={rating === 0 || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </form>
  );
}
