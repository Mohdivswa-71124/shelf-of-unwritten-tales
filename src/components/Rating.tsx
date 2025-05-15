
import React from 'react';
import { RatingStars } from '@/components/RatingStars';
import { Loader2 } from 'lucide-react';

interface RatingProps {
  value: number | null;
  onChange: (rating: number | null) => void;
  isUpdating?: boolean;
}

export const Rating: React.FC<RatingProps> = ({ value, onChange, isUpdating = false }) => {
  return (
    <div className="flex items-center">
      <RatingStars 
        rating={value || 0} 
        interactive={true}
        onRatingChange={(newRating) => onChange(newRating)} 
      />
      {isUpdating && (
        <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
      )}
    </div>
  );
};
