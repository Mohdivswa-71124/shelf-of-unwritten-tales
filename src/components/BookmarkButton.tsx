
import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Bookmark, Check, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BookmarkButtonProps extends Omit<ButtonProps, "onClick"> {
  bookId: string;
  userId: string;
  currentPage: number;
  existingBookmark?: { id: string; page_number: number } | null;
  buttonText?: string;
  showDelete?: boolean;
  onBookmarkUpdated?: () => void;
}

export const BookmarkButton = ({ 
  bookId, 
  userId, 
  currentPage, 
  existingBookmark,
  buttonText = "Bookmark Page",
  showDelete = false,
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

  const handleDeleteBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!existingBookmark) return;
    
    try {
      setIsProcessing(true);
      
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", existingBookmark.id);
        
      if (error) throw new Error(error.message);
      
      toast({
        title: "Bookmark removed",
        description: "Your bookmark has been deleted",
      });
      
      if (onBookmarkUpdated) {
        onBookmarkUpdated();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete bookmark",
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
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isCurrentPageBookmarked ? "default" : "outline"}
              onClick={handleBookmark}
              disabled={isProcessing}
              className="rounded-full flex-1"
              {...props}
            >
              {isCurrentPageBookmarked ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Bookmark className="mr-2 h-4 w-4" />
              )}
              {displayText}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {existingBookmark 
              ? `Bookmark at page ${existingBookmark.page_number}` 
              : "Add a bookmark at current page"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {showDelete && existingBookmark && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleDeleteBookmark}
                disabled={isProcessing}
                className="rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Delete bookmark
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
