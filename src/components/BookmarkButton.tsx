
import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Bookmark, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BookmarkButtonProps extends Omit<ButtonProps, "onClick"> {
  bookId: string;
  userId: string;
  currentPage: number;
  existingBookmark?: { id: string; page_number: number } | null;
  buttonText?: string;
  onBookmarkUpdated?: () => void;
}

export const BookmarkButton = ({ 
  bookId, 
  userId, 
  currentPage, 
  existingBookmark,
  buttonText = "Bookmark Page",
  onBookmarkUpdated,
  ...props 
}: BookmarkButtonProps) => {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const { toast } = useToast();
  
  const isCurrentPageBookmarked = existingBookmark?.page_number === currentPage;

  const handleBookmark = async () => {
    try {
      setIsProcessing(true);
      
      if (existingBookmark) {
        // Update existing bookmark
        const { error } = await supabase
          .from("bookmarks")
          .update({ page_number: currentPage })
          .eq("id", existingBookmark.id);
          
        if (error) throw new Error(error.message);
        
        toast({
          title: "Bookmark updated",
          description: `Page ${currentPage} bookmarked`,
        });
      } else {
        // Create new bookmark
        const { error } = await supabase
          .from("bookmarks")
          .insert({ 
            book_id: bookId, 
            user_id: userId, 
            page_number: currentPage 
          });
          
        if (error) throw new Error(error.message);
        
        toast({
          title: "Page bookmarked",
          description: `You can resume reading from page ${currentPage}`,
        });
      }
      
      if (onBookmarkUpdated) {
        onBookmarkUpdated();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to bookmark page",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine button text to show reading progress
  const displayText = existingBookmark 
    ? isCurrentPageBookmarked 
      ? buttonText 
      : `Update Bookmark (Currently: Page ${existingBookmark.page_number})`
    : buttonText;
  
  return (
    <Button
      variant={isCurrentPageBookmarked ? "default" : "outline"}
      onClick={handleBookmark}
      disabled={isProcessing}
      className="rounded-full"
      {...props}
    >
      {isCurrentPageBookmarked ? (
        <Check className="mr-2 h-4 w-4" />
      ) : (
        <Bookmark className="mr-2 h-4 w-4" />
      )}
      {displayText}
    </Button>
  );
};
