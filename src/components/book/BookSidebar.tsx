import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bookmark, 
  BookCheck, 
  Heart, 
  BookOpenCheck,
  Book,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Rating } from "@/components/Rating";

interface BookSidebarProps {
  book: any;
  categoryName: string;
  currentPage: number;
  totalPages: number;
  bookmark: any;
  readingHistory: any;
  userId?: string;
  onBookmarkUpdated: () => void;
  onHistoryUpdated: () => void;
}

export const BookSidebar: React.FC<BookSidebarProps> = ({
  book,
  categoryName,
  currentPage,
  totalPages,
  bookmark,
  readingHistory,
  userId,
  onBookmarkUpdated,
  onHistoryUpdated
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddingFavorite, setIsAddingFavorite] = React.useState(false);
  const [isMarkingCompleted, setIsMarkingCompleted] = React.useState(false);
  const [rating, setRating] = React.useState<number | null>(readingHistory?.rating || null);
  const [isUpdatingRating, setIsUpdatingRating] = React.useState(false);

  const isBookFavorited = !!readingHistory?.is_favorite;
  const isBookCompleted = !!readingHistory?.completed_at;

  const handleAddToFavorites = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please login to add books to favorites",
        variant: "destructive",
      });
      return;
    }

    setIsAddingFavorite(true);
    try {
      const { error } = await supabase
        .from("reading_history")
        .upsert(
          { 
            user_id: userId, 
            book_id: book.id, 
            is_favorite: !isBookFavorited 
          },
          { onConflict: 'user_id, book_id' }
        );

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Success",
        description: isBookFavorited ? "Removed from favorites" : "Added to favorites",
      });
      onHistoryUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update favorites",
        variant: "destructive",
      });
    } finally {
      setIsAddingFavorite(false);
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please login to mark books as completed",
        variant: "destructive",
      });
      return;
    }

    setIsMarkingCompleted(true);
    try {
      const { error } = await supabase
        .from("reading_history")
        .upsert(
          { 
            user_id: userId, 
            book_id: book.id, 
            completed_at: isBookCompleted ? null : new Date().toISOString() 
          },
          { onConflict: 'user_id, book_id' }
        );

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Success",
        description: isBookCompleted ? "Marked as unread" : "Marked as completed",
      });
      onHistoryUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update reading status",
        variant: "destructive",
      });
    } finally {
      setIsMarkingCompleted(false);
    }
  };

  const handleRatingChange = async (newRating: number | null) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please login to rate books",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingRating(true);
    try {
      const { error } = await supabase
        .from("reading_history")
        .upsert(
          { 
            user_id: userId, 
            book_id: book.id, 
            rating: newRating 
          },
          { onConflict: 'user_id, book_id' }
        );

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Success",
        description: "Rating updated successfully",
      });
      setRating(newRating);
      onHistoryUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update rating",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingRating(false);
    }
  };

  return (
    <Card className="bg-secondary/70">
      <CardHeader>
        <CardTitle className="text-lg font-semibold truncate">{book.title}</CardTitle>
        <CardDescription>
          Category: {categoryName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Button
            variant="outline"
            className="justify-start book-action-button"
            onClick={() => navigate(`/read/${book.id}`)}
          >
            <Book className="mr-2 h-4 w-4" />
            {book.file_url ? 'Open Book' : 'Read Book'}
          </Button>
          
          {userId && (
            <>
              <Button
                variant={isBookFavorited ? "default" : "outline"}
                className="justify-start book-action-button"
                onClick={handleAddToFavorites}
                disabled={isAddingFavorite}
              >
                {isAddingFavorite ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    {isBookFavorited ? 'Unfavorite' : 'Favorite'}
                  </>
                )}
              </Button>
              
              <Button
                variant={isBookCompleted ? "default" : "outline"}
                className="justify-start book-action-button"
                onClick={handleMarkAsCompleted}
                disabled={isMarkingCompleted}
              >
                {isMarkingCompleted ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <BookCheck className="mr-2 h-4 w-4" />
                    {isBookCompleted ? 'Mark as Unread' : 'Mark as Completed'}
                  </>
                )}
              </Button>
            </>
          )}
        </div>
        
        {userId && (
          <div>
            <p className="text-sm font-medium">Rate this book:</p>
            <Rating 
              value={rating} 
              onChange={handleRatingChange} 
              isUpdating={isUpdatingRating}
            />
          </div>
        )}
      </CardContent>
      
      {bookmark && userId && (
        <CardFooter className="justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Bookmarked on page {bookmark.page_number}
          </p>
          <Button 
            size="sm" 
            onClick={() => navigate(`/read/${book.id}`)}
            className="book-action-button"
          >
            Continue Reading
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
