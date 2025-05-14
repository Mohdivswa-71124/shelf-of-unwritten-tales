
import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { BookCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CompleteBookButtonProps extends Omit<ButtonProps, "onClick"> {
  bookId: string;
  userId: string;
  onComplete?: () => void;
}

export const CompleteBookButton = ({ 
  bookId, 
  userId, 
  onComplete,
  ...props 
}: CompleteBookButtonProps) => {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const { toast } = useToast();
  
  const handleComplete = async () => {
    try {
      setIsProcessing(true);
      
      const { error } = await supabase
        .from("reading_history")
        .insert({ 
          book_id: bookId, 
          user_id: userId
        });
        
      if (error) throw new Error(error.message);
      
      toast({
        title: "Book completed",
        description: "Book marked as completed in your reading history",
      });
      
      if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark book as completed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Button
      variant="outline"
      onClick={handleComplete}
      disabled={isProcessing}
      {...props}
    >
      <BookCheck className="mr-2 h-4 w-4" />
      Mark as Completed
    </Button>
  );
};
