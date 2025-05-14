
import { Button } from "@/components/ui/button";
import { Heart, ExternalLink, Bookmark, Download } from "lucide-react";
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
  const [isStoring, setIsStoring] = useState(false);
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
  
  const handleStoreBook = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please login to store books",
        variant: "destructive",
      });
      return;
    }
    
    if (!fileUrl) {
      toast({
        title: "Error",
        description: "This book has no file to store",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsStoring(true);
      
      if (!bookmark) {
        // If no bookmark exists, create one to mark as stored
        const { error } = await supabase
          .from("bookmarks")
          .insert({ 
            book_id: bookId, 
            user_id: userId, 
            page_number: currentPage 
          });
          
        if (error) throw new Error(error.message);
        
        onBookmarkUpdated();
      }
      
      toast({
        title: "Book stored",
        description: "Book has been saved to your stored books",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to store book",
        variant: "destructive",
      });
    } finally {
      setIsStoring(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={handleAddToFavorites} 
        disabled={isAddingToFavorites}
        className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
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
            showDelete={true}
            className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700"
          />
          
          {!readingHistory && (
            <CompleteBookButton 
              bookId={bookId}
              userId={userId}
              onComplete={onHistoryUpdated}
            />
          )}
          
          <Button 
            onClick={handleStoreBook} 
            disabled={isStoring}
            className="w-full rounded-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
          >
            <Download className="mr-2 h-4 w-4" /> 
            Store Book
          </Button>
        </>
      )}
      
      {fileUrl && (
        <Button asChild variant="outline" className="w-full rounded-full">
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" /> Open PDF
          </a>
        </Button>
      )}
    </div>
  );
};
