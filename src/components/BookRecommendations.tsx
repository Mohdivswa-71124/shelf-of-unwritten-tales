
import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import BookGrid from "@/components/BookGrid";

interface BookRecommendationsProps {
  userId: string;
  readingHistory: any[];
  favorites: any[];
}

export const BookRecommendations: React.FC<BookRecommendationsProps> = ({ 
  userId, 
  readingHistory,
  favorites 
}) => {
  // Get the preferred genres based on reading history and favorites
  const preferredGenres = React.useMemo(() => {
    const genres = new Map<string, number>();
    
    // Count genres from reading history
    readingHistory.forEach(item => {
      if (item.book?.genre) {
        const count = genres.get(item.book.genre) || 0;
        genres.set(item.book.genre, count + 2); // Give more weight to completed books
      }
    });
    
    // Count genres from favorites
    favorites.forEach(item => {
      if (item.book?.genre) {
        const count = genres.get(item.book.genre) || 0;
        genres.set(item.book.genre, count + 1);
      }
    });
    
    // Sort by count and get top 3 genres
    return Array.from(genres.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
  }, [readingHistory, favorites]);
  
  // Get books by preferred genres
  const { data: recommendedBooks = [], isLoading } = useQuery({
    queryKey: ["recommendations", userId, preferredGenres],
    queryFn: async () => {
      if (preferredGenres.length === 0) {
        // If no preferred genres, get recent books
        const { data, error } = await supabase
          .from("books")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(8);
          
        if (error) throw new Error(error.message);
        
        return (data || []).map(book => ({
          ...book,
          cover_image: book.cover_url,
          category: book.genre
        })) as Book[];
      }
      
      // Get books from preferred genres
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .in("genre", preferredGenres)
        .order("created_at", { ascending: false })
        .limit(8);
        
      if (error) throw new Error(error.message);
      
      // Get read book ids to exclude books already read
      const readBookIds = new Set(readingHistory.map(item => item.book_id));
      
      return (data || [])
        .filter(book => !readBookIds.has(book.id))
        .map(book => ({
          ...book,
          cover_image: book.cover_url,
          category: book.genre
        })) as Book[];
    },
    enabled: preferredGenres.length > 0 || readingHistory.length > 0,
  });
  
  // Get popular books if user has no reading history
  const { data: popularBooks = [], isLoading: isLoadingPopular } = useQuery({
    queryKey: ["popular-books"],
    queryFn: async () => {
      // In a real app, you might have a column for popularity or count favorites
      // Here we're just getting the most recent books as "popular"
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
        
      if (error) throw new Error(error.message);
      
      return (data || []).map(book => ({
        ...book,
        cover_image: book.cover_url,
        category: book.genre
      })) as Book[];
    },
    enabled: readingHistory.length === 0 && favorites.length === 0,
  });
  
  const booksToShow = readingHistory.length > 0 || favorites.length > 0 
    ? recommendedBooks 
    : popularBooks;
  
  const isLoadingAny = isLoading || isLoadingPopular;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {readingHistory.length > 0 || favorites.length > 0 
            ? "Personalized Recommendations" 
            : "Popular Books"}
        </CardTitle>
        <CardDescription>
          {readingHistory.length > 0 || favorites.length > 0
            ? "Books you might enjoy based on your reading history"
            : "Popular books from our library"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingAny ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : booksToShow.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-1">No recommendations available</h3>
            <p className="text-muted-foreground">
              Complete more books or add favorites to get personalized recommendations
            </p>
          </div>
        ) : (
          <BookGrid books={booksToShow} />
        )}
      </CardContent>
    </Card>
  );
};
