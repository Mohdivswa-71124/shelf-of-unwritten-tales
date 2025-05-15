
import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import BookGrid from "@/components/BookGrid";
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { toast } from "@/components/ui/use-toast"; // Changed to use the correct toast import

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
  const navigate = useNavigate();
  
  // Get the current session
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!sessionLoading && session === null) {
      toast({
        title: "Authentication required",
        description: "Please login to view your favorites",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [session, navigate, sessionLoading]);
  
  const { data: books = [], isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
    enabled: !!session,
  });

  // Don't render anything while checking authentication
  if (sessionLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }

  // If not authenticated, don't render content (will redirect)
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="my-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center">
            <BookOpen className="mr-2" /> Your Favorites
          </h1>
          
          {books.length === 0 && !isLoading ? (
            <div className="text-center p-12 bg-muted/20 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground">
                Start exploring our collection and add books to your favorites.
              </p>
            </div>
          ) : (
            <BookGrid books={books} isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
