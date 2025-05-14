
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book } from "@/types/book";
import { useToast } from "@/hooks/use-toast";
import { Heart, BookOpen, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface BookCardProps {
  book: Book;
  onAddToFavorites?: (bookId: string) => void;
  gradientClass?: string;
  isStored?: boolean;
}

const BookCard = ({ book, onAddToFavorites, gradientClass = "card-gradient-1", isStored = false }: BookCardProps) => {
  const { toast } = useToast();
  const [isAddingToFavorites, setIsAddingToFavorites] = React.useState(false);
  
  // Get categories to display proper name
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*");
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Find category name from genre ID if available
  const categoryName = React.useMemo(() => {
    if (book.genre && categories.length > 0) {
      const category = categories.find(c => c.id === book.genre);
      if (category) return category.name;
    }
    return book.category || "Uncategorized";
  }, [book, categories]);

  const handleAddToFavorites = () => {
    if (onAddToFavorites) {
      setIsAddingToFavorites(true);
      
      try {
        onAddToFavorites(book.id);
      } finally {
        setIsAddingToFavorites(false);
      }
    }
  };

  return (
    <Card className={`overflow-hidden h-full flex flex-col book-card ${gradientClass}`}>
      <div className="relative p-3">
        <AspectRatio ratio={2/3} className="bg-muted rounded-md overflow-hidden">
          {book.cover_image || book.cover_url ? (
            <img
              src={book.cover_image || book.cover_url}
              alt={book.title}
              className="object-cover w-full h-full rounded-md"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-primary/5">
              <BookOpen size={48} className="text-primary/50" />
            </div>
          )}
        </AspectRatio>
        <div className="absolute top-5 right-5">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm shadow-sm">
            {categoryName}
          </Badge>
        </div>
        
        {isStored && book.bookmark_page && (
          <div className="absolute bottom-5 left-5">
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              Page {book.bookmark_page}
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="flex-grow p-4 pt-1">
        <h3 className="text-lg font-semibold line-clamp-2 mb-1 h-14">{book.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
          {book.author}
          {book.publication_year && ` • ${book.publication_year}`}
        </p>
        <p className="text-sm line-clamp-3 text-muted-foreground">{book.description}</p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddToFavorites}
          disabled={isAddingToFavorites}
          className="flex-1 rounded-full border-primary/50"
        >
          <Heart className="mr-2 h-4 w-4" /> Favorite
        </Button>
        {book.file_url && (
          <Button size="sm" asChild className="flex-1 rounded-full">
            <Link to={`/read/${book.id}`}>
              <BookOpen className="mr-2 h-4 w-4" /> Read
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BookCard;
