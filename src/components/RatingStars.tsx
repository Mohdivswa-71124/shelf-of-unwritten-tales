
import React from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 16,
  interactive = false,
  onRatingChange,
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);
  
  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index);
    }
  };
  
  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index);
    }
  };
  
  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };
  
  return (
    <div className="flex items-center">
      {Array.from({ length: maxRating }).map((_, index) => {
        const starIndex = index + 1;
        const isFilled = interactive
          ? starIndex <= (hoverRating || rating)
          : starIndex <= rating;
        
        return (
          <Star
            key={index}
            size={size}
            className={`
              ${isFilled ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
              ${interactive ? "cursor-pointer transition-colors" : ""}
            `}
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onMouseLeave={() => handleMouseLeave()}
          />
        );
      })}
    </div>
  );
};
