
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import BookGrid from "@/components/BookGrid";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { motion } from "framer-motion";

const fetchCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order('name');
    
  if (error) {
    console.error("Error fetching categories:", error);
    throw new Error(error.message);
  }
  
  return data || [];
};

const fetchBooks = async (categoryId: string | null = null) => {
  let query = supabase.from("books").select("*");
  
  if (categoryId && categoryId !== "all") {
    // Filter by genre ID
    query = query.eq("genre", categoryId);
  }
  
  const { data, error } = await query.order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching books:", error);
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
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const { toast } = useToast();
  
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  
  const { data: books = [], isLoading, refetch: refetchBooks } = useQuery({
    queryKey: ["books", selectedCategoryId],
    queryFn: () => fetchBooks(selectedCategoryId === "all" ? null : selectedCategoryId),
  });

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });
  
  // Find the name of the selected category
  const selectedCategoryName = selectedCategoryId === "all" 
    ? "All Books" 
    : categories.find(c => c.id === selectedCategoryId)?.name || "All Books";

  const handleAddToFavorites = async (bookId: string) => {
    try {
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please login to add books to favorites",
          variant: "destructive",
        });
        return;
      }
      
      await addToFavorites(bookId, session.user.id);
      
      toast({
        title: "Success",
        description: "Book added to favorites",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add book to favorites",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="my-8 text-center"
        >
          <h1 className="text-4xl font-bold mb-4">Welcome to Bookshelf</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover, share, and enjoy your favorite books from our growing collection.
            Browse through different categories or upload your own books.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="my-12 bg-primary/5 rounded-lg p-6 shadow-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Browse by Category</h2>
          
          <Tabs 
            defaultValue="all"
            value={selectedCategoryId} 
            onValueChange={setSelectedCategoryId}
            className="w-full"
          >
            <div className="relative overflow-hidden">
              <TabsList className="flex w-full overflow-x-auto py-2 mb-6 no-scrollbar">
                <TabsTrigger value="all" className="flex-shrink-0 rounded-full">
                  All Books
                </TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="flex-shrink-0 rounded-full"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <TabsContent value={selectedCategoryId} className="mt-6">
              <motion.div
                key={selectedCategoryId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-6">{selectedCategoryName}</h2>
                <BookGrid 
                  books={books} 
                  isLoading={isLoading} 
                  onAddToFavorites={handleAddToFavorites}
                />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
