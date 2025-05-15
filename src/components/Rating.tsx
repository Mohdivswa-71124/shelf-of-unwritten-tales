
import React from "react";
import { Loader2 } from "lucide-react";
import { RatingStars } from "./RatingStars";

interface RatingProps {
  value: number | null;
  onChange: (rating: number | null) => void;
  isUpdating?: boolean;
  maxRating?: number;
}

export const Rating: React.FC<RatingProps> = ({ 
  value, 
  onChange, 
  isUpdating = false,
  maxRating = 5
}) => {
  return (
    <div className="flex items-center gap-2">
      <RatingStars 
        rating={value || 0} 
        maxRating={maxRating}
        interactive={!isUpdating}
        onRatingChange={(newRating) => onChange(newRating)} 
      />
      {isUpdating && (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      )}
    </div>
  );
};
