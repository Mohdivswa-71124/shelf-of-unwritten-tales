
import React from "react";
import { useQuery } from "@tanstack/react-query";
import BookGrid from "@/components/BookGrid";
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";
import Header from "@/components/Header";

const fetchFavorites = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const { data, error } = await supabase
    .from("favorites")
    .select("book_id, books(*)")
    .eq("user_id", user.id);
    
  if (error) {
    throw new Error(error.message);
  }
  
  // Transform the nested data structure to match the Book type
  return data.map(item => {
    const bookData = item.books as any;
    return {
      ...bookData,
      category: bookData.genre, // Map genre to category for frontend compatibility
      cover_image: bookData.cover_url, // Map cover_url to cover_image for frontend compatibility
      user_id: bookData.created_by // Map created_by to user_id for frontend compatibility
    } as Book;
  });
};

const Favorites = () => {
  const { data: books = [], isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      
      <div className="my-8">
        <h2 className="text-2xl font-bold mb-4">Your Favorites</h2>
        <BookGrid books={books} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Favorites;
