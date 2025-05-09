
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book } from "@/types/book";
import { useToast } from "@/hooks/use-toast";

interface BookCardProps {
  book: Book;
  onAddToFavorites?: (bookId: string) => void;
}

const BookCard = ({ book, onAddToFavorites }: BookCardProps) => {
  const { toast } = useToast();

  const handleAddToFavorites = () => {
    if (onAddToFavorites) {
      onAddToFavorites(book.id);
      toast({
        title: "Added to favorites",
        description: `${book.title} has been added to your favorites.`,
      });
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48 bg-muted">
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={book.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <span className="text-muted-foreground">No Cover</span>
          </div>
        )}
      </div>
      <CardContent className="flex-grow p-4">
        <h3 className="text-lg font-semibold line-clamp-1">{book.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {book.author}
        </p>
        <div className="mt-2">
          <span className="inline-block px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">
            {book.category}
          </span>
        </div>
        <p className="mt-2 text-sm line-clamp-2">{book.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddToFavorites}
        >
          Add to Favorites
        </Button>
        {book.file_url && (
          <Button size="sm" asChild>
            <a href={book.file_url} target="_blank" rel="noreferrer">
              Read
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BookCard;
