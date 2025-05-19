import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import BookGrid from "@/components/BookGrid";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { BookOpen, LibraryBig, BookText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// API endpoint for fetching books
const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";
const fetchCategories = async () => {
  const {
    data,
    error
  } = await supabase.from("categories").select("id, name").order('name');
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
  const {
    data,
    error
  } = await query.order("created_at", {
    ascending: false
  });
  if (error) {
    console.error("Error fetching books:", error);
    throw new Error(error.message);
  }

  // Transform the data to match our Book type
  return (data || []).map(item => ({
    ...item,
    category: item.genre,
    // Map genre to category for frontend compatibility
    cover_image: item.cover_url,
    // Map cover_url to cover_image for frontend compatibility
    user_id: item.created_by // Map created_by to user_id for frontend compatibility
  })) as Book[];
};
const fetchPublicBooks = async (category: string) => {
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API}?q=subject:${category}&maxResults=10`);
    const data = await response.json();
    if (!data.items) return [];
    return data.items.map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title || "Unknown Title",
      author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : "Unknown Author",
      description: item.volumeInfo.description || "No description available",
      cover_image: item.volumeInfo.imageLinks?.thumbnail || null,
      file_url: item.volumeInfo.previewLink || null,
      publication_year: item.volumeInfo.publishedDate ? parseInt(item.volumeInfo.publishedDate.slice(0, 4)) : null,
      genre: category,
      category: category,
      isPublic: true
    }));
  } catch (error) {
    console.error("Error fetching public books:", error);
    return [];
  }
};
const addToFavorites = async (bookId: string, userId: string) => {
  const {
    error
  } = await supabase.from("favorites").insert({
    book_id: bookId,
    user_id: userId
  });
  if (error) {
    throw new Error(error.message);
  }
  return true;
};
const Index = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const {
    toast
  } = useToast();
  const {
    data: categories = []
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories
  });
  const {
    data: books = [],
    isLoading,
    refetch: refetchBooks
  } = useQuery({
    queryKey: ["books", selectedCategoryId],
    queryFn: () => fetchBooks(selectedCategoryId === "all" ? null : selectedCategoryId)
  });
  const {
    data: session
  } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const {
        data
      } = await supabase.auth.getSession();
      return data.session;
    }
  });

  // Fetch public books for selected category
  const {
    data: publicBooks = [],
    isLoading: isLoadingPublic
  } = useQuery({
    queryKey: ["public-books", selectedCategoryId],
    queryFn: () => {
      // Use a specific category name for API query
      const categoryName = selectedCategoryId === "all" ? "fiction" : categories.find(c => c.id === selectedCategoryId)?.name?.toLowerCase() || "fiction";
      return fetchPublicBooks(categoryName);
    },
    enabled: selectedCategoryId !== null
  });

  // Find the name of the selected category
  const selectedCategoryName = selectedCategoryId === "all" ? "All Books" : categories.find(c => c.id === selectedCategoryId)?.name || "All Books";

  // Combine both local and public books
  const combinedBooks = [...books, ...publicBooks].filter(book => book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.author.toLowerCase().includes(searchQuery.toLowerCase()));
  const handleAddToFavorites = async (bookId: string) => {
    try {
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please login to add books to favorites",
          variant: "destructive"
        });
        return;
      }
      await addToFavorites(bookId, session.user.id);
      toast({
        title: "Success",
        description: "Book added to favorites"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add book to favorites",
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 bg-cyan-50">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="my-8 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Welcome to Bookshelf</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover, share, and enjoy your favorite books from our growing collection.
            Browse through different categories or upload your own books.
          </p>
        </motion.div>
        
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 0.2
      }} className="my-12 rounded-xl p-6 shadow-md bg-gradient-to-br from-secondary/50 to-background bg-cyan-900">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <LibraryBig className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Browse by Category</h2>
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search books..." className="pl-10 rounded-full" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          
          <Tabs defaultValue="all" value={selectedCategoryId} onValueChange={setSelectedCategoryId} className="w-full">
            <ScrollArea className="w-full">
              <div className="relative mb-6 pb-1">
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
                
                <TabsList className="flex w-full overflow-x-auto py-2 px-12 flex-nowrap justify-start space-x-2 bg-transparent">
                  <TabsTrigger value="all" className="category-tab flex-shrink-0">
                    All Books
                  </TabsTrigger>
                  {categories.map(category => <TabsTrigger key={category.id} value={category.id} className="category-tab flex-shrink-0">
                      {category.name}
                    </TabsTrigger>)}
                </TabsList>
              </div>
            </ScrollArea>
            
            <TabsContent value={selectedCategoryId} className="mt-6">
              <motion.div key={selectedCategoryId} initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              duration: 0.3
            }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <BookText className="h-5 w-5 text-primary" />
                    {selectedCategoryName}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {combinedBooks.length} books found
                  </p>
                </div>
                
                <BookGrid books={combinedBooks} isLoading={isLoading || isLoadingPublic} onAddToFavorites={handleAddToFavorites} />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>;
};
export default Index;