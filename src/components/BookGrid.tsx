
import React from "react";
import BookCard from "./BookCard";
import { Book } from "@/types/book";
import { motion } from "framer-motion";

interface BookGridProps {
  books: Book[];
  isLoading?: boolean;
  onAddToFavorites?: (bookId: string) => void;
  isStored?: boolean;
  onBookDeleted?: () => void; // Added this prop to match what Profile.tsx is passing
}

const BookGrid = ({ books, isLoading, onAddToFavorites, isStored = false, onBookDeleted }: BookGridProps) => {
  const gradientClasses = ["card-gradient-1", "card-gradient-2", "card-gradient-3", "card-gradient-4", "card-gradient-5"];
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-96 rounded-lg overflow-hidden shadow-md relative loading-shimmer" />
        ))}
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
      {books.map((book, index) => (
        <motion.div
          key={book.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <BookCard
            book={book}
            onAddToFavorites={onAddToFavorites}
            gradientClass={gradientClasses[index % gradientClasses.length]}
            isStored={isStored}
            onBookDeleted={onBookDeleted}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default BookGrid;
