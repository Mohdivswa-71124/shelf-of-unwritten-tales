import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BookGrid from "@/components/BookGrid";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

const fetchBooks = async (category: string | null = null) => {
  let query = supabase.from("books").select("*");
  
  if (category && category !== "All Books") {
    // Map frontend category to database genre field
    query = query.eq("genre", category);
  }
  
  const { data, error } = await query.order("created_at", { ascending: false });
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Transform the data to match our Book type
  return (data || []).map(item => ({
    ...item,
    category: item.genre, // Map genre to category for frontend compatibility
    cover_image: item.cover_url, // Map cover_url to cover_image for frontend compatibility
    user_id: item.created_by // Map created_by to user_id for frontend compatibility
  })) as Book[];
};

const addToFavorites = async (bookId: string, userId: string) => {
  const { error } = await supabase
    .from("favorites")
    .insert({ book_id: bookId, user_id: userId });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return true;
};

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Books");
  const { toast } = useToast();
  const categories = ["All Books", "Fiction", "History", "Mystery", "Non-fiction", "Science"];
  
  const { data: books = [], isLoading } = useQuery({
    queryKey: ["books", selectedCategory],
    queryFn: () => fetchBooks(selectedCategory === "All Books" ? null : selectedCategory),
  });

  const handleAddToFavorites = async (bookId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please login to add books to favorites",
          variant: "destructive",
        });
        return;
      }
      
      await addToFavorites(bookId, user.id);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add book to favorites",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      
      <div className="my-8">
        <h2 className="text-2xl font-bold mb-4">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="my-8">
        <h2 className="text-2xl font-bold mb-4">{selectedCategory}</h2>
        <BookGrid 
          books={books} 
          isLoading={isLoading} 
          onAddToFavorites={handleAddToFavorites}
        />
      </div>
    </div>
  );
};

export default Index;
