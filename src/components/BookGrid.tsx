
import React from "react";
import BookCard from "./BookCard";
import { Book } from "@/types/book";

interface BookGridProps {
  books: Book[];
  isLoading?: boolean;
  onAddToFavorites?: (bookId: string) => void;
}

const BookGrid = ({ books, isLoading, onAddToFavorites }: BookGridProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">No books found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onAddToFavorites={onAddToFavorites}
        />
      ))}
    </div>
  );
};

export default BookGrid;
