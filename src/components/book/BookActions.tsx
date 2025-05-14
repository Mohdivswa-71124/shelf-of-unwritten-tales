
import { Button } from "@/components/ui/button";
import { Heart, ExternalLink } from "lucide-react";
import { BookmarkButton } from "@/components/BookmarkButton";
import { CompleteBookButton } from "@/components/CompleteBookButton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BookActionsProps {
  bookId: string;
  userId?: string;
  currentPage: number;
  bookmark: any;
  readingHistory: any;
  fileUrl?: string;
  onBookmarkUpdated: () => void;
  onHistoryUpdated: () => void;
}

export const BookActions = ({ 
  bookId, 
  userId, 
  currentPage, 
  bookmark, 
  readingHistory,
  fileUrl,
  onBookmarkUpdated, 
  onHistoryUpdated 
}: BookActionsProps) => {
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
  const { toast } = useToast();

  const handleAddToFavorites = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please login to add books to favorites",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsAddingToFavorites(true);
      
      const { error } = await supabase
        .from("favorites")
        .insert({ book_id: bookId, user_id: userId });
        
      if (error) throw new Error(error.message);
      
      toast({
        title: "Success",
        description: "Book added to favorites",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add book to favorites",
        variant: "destructive",
      });
    } finally {
      setIsAddingToFavorites(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={handleAddToFavorites} 
        disabled={isAddingToFavorites}
        className="w-full"
      >
        <Heart className="mr-2 h-4 w-4" /> 
        Add to Favorites
      </Button>
      
      {userId && (
        <>
          <BookmarkButton 
            bookId={bookId} 
            userId={userId} 
            currentPage={currentPage}
            existingBookmark={bookmark}
            onBookmarkUpdated={onBookmarkUpdated}
          />
          
          {!readingHistory && (
            <CompleteBookButton 
              bookId={bookId}
              userId={userId}
              onComplete={onHistoryUpdated}
            />
          )}
        </>
      )}
      
      {fileUrl && (
        <Button asChild variant="outline" className="w-full">
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" /> Open PDF
          </a>
        </Button>
      )}
    </div>
  );
};
