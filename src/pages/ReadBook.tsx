
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ArrowLeft, ExternalLink, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const ReadBook = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
  
  // Fetch the current book
  const { data: book, isLoading: isLoadingBook } = useQuery({
    queryKey: ["book", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw new Error(error.message);
      
      return {
        ...data,
        cover_image: data.cover_url,
        category: data.genre
      } as Book;
    },
    enabled: !!id,
  });
  
  // Get user session
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });
  
  // Get categories to display proper name
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*");
      return data || [];
    },
  });
  
  // Find category name from genre ID if available
  const categoryName = React.useMemo(() => {
    if (book?.genre && categories.length > 0) {
      const category = categories.find(c => c.id === book.genre);
      if (category) return category.name;
    }
    return book?.category || "Uncategorized";
  }, [book, categories]);
  
  const handleAddToFavorites = async () => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please login to add books to favorites",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsAddingToFavorites(true);
      
      const { error } = await supabase
        .from("favorites")
        .insert({ book_id: id, user_id: session.user.id });
        
      if (error) throw new Error(error.message);
      
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
    } finally {
      setIsAddingToFavorites(false);
    }
  };
  
  if (isLoadingBook) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center p-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Book Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The book you're looking for could not be found.
              </p>
              <Button variant="default" onClick={() => navigate('/')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Books
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold truncate">{book.title}</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-4">
                {book.cover_image || book.cover_url ? (
                  <img 
                    src={book.cover_image || book.cover_url} 
                    alt={book.title}
                    className="w-full h-auto rounded-md object-cover"
                  />
                ) : (
                  <div className="aspect-[2/3] bg-muted rounded-md flex items-center justify-center">
                    <BookOpen size={64} className="text-muted-foreground" />
                  </div>
                )}
                
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="font-medium">Author</h3>
                    <p>{book.author}</p>
                  </div>
                  
                  {book.publication_year && (
                    <div>
                      <h3 className="font-medium">Published</h3>
                      <p>{book.publication_year}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium">Category</h3>
                    <Badge variant="outline">{categoryName}</Badge>
                  </div>
                  
                  <Button 
                    onClick={handleAddToFavorites} 
                    disabled={isAddingToFavorites}
                    className="w-full"
                  >
                    <Heart className="mr-2 h-4 w-4" /> 
                    Add to Favorites
                  </Button>
                  
                  {book.file_url && (
                    <Button asChild variant="outline" className="w-full">
                      <a href={book.file_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" /> Open in New Tab
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{book.description}</p>
              </CardContent>
            </Card>
            
            {book.file_url && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Read</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full h-[600px] bg-white rounded-md shadow-sm">
                    <iframe
                      src={book.file_url}
                      title={book.title}
                      className="w-full h-full rounded-md"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadBook;
