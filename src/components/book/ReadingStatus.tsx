
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpenText } from "lucide-react";
import { RatingStars } from "@/components/RatingStars";

interface ReadingStatusProps {
  readingHistory: {
    completed_at: string;
    rating?: number;
    review?: string;
  };
}

export const ReadingStatus = ({ readingHistory }: ReadingStatusProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center">
          <BookOpenText className="mr-2 h-4 w-4" /> Reading Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2">
          <span className="font-medium">Completed:</span>{" "}
          {new Date(readingHistory.completed_at).toLocaleDateString()}
        </p>
        
        {readingHistory.rating && (
          <div className="mb-2">
            <span className="text-sm font-medium">Your Rating: </span>
            <RatingStars rating={readingHistory.rating} maxRating={5} />
          </div>
        )}
        
        {readingHistory.review && (
          <div>
            <span className="text-sm font-medium">Your Review:</span>
            <p className="text-sm mt-1 italic">"{readingHistory.review}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
