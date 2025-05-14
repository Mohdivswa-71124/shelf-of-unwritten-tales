
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Heart, ArrowLeft, ExternalLink, BookOpen, Bookmark, ChevronLeft, ChevronRight, BookOpenText, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { BookPageContent } from "@/components/BookPageContent";
import { BookmarkButton } from "@/components/BookmarkButton";
import { CompleteBookButton } from "@/components/CompleteBookButton";
import { RatingStars } from "@/components/RatingStars";

const ReadBook = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
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
  
  // Get book pages
  const { data: bookPages = [], isLoading: isLoadingPages } = useQuery({
    queryKey: ["book-pages", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_pages")
        .select("*")
        .eq("book_id", id)
        .order("page_number", { ascending: true });
      
      if (error) throw new Error(error.message);
      
      return data || [];
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
  
  // Get user bookmark
  const { data: bookmark, refetch: refetchBookmark } = useQuery({
    queryKey: ["bookmark", id, session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return null;
      
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("book_id", id)
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (error) throw new Error(error.message);
      
      return data;
    },
    enabled: !!id && !!session?.user,
  });
  
  // Get categories to display proper name
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*");
      return data || [];
    },
  });
  
  // Get reading history
  const { data: readingHistory, refetch: refetchHistory } = useQuery({
    queryKey: ["reading-history", id, session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return null;
      
      const { data, error } = await supabase
        .from("reading_history")
        .select("*")
        .eq("book_id", id)
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (error) throw new Error(error.message);
      
      return data;
    },
    enabled: !!id && !!session?.user,
  });

  // Set initial page from bookmark if exists
  useEffect(() => {
    if (bookmark && bookmark.page_number) {
      setCurrentPage(bookmark.page_number);
      toast({
        title: "Bookmark found",
        description: `Resuming from page ${bookmark.page_number}`,
      });
    }
  }, [bookmark, toast]);
  
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

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < bookPages.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const currentPageContent = bookPages.find(p => p.page_number === currentPage);
  
  if (isLoadingBook || isLoadingPages) {
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
                  <AspectRatio ratio={2/3} className="bg-muted overflow-hidden rounded-md">
                    <img 
                      src={book.cover_image || book.cover_url} 
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                ) : (
                  <AspectRatio ratio={2/3}>
                    <div className="aspect-[2/3] bg-muted rounded-md flex items-center justify-center">
                      <BookOpen size={64} className="text-muted-foreground" />
                    </div>
                  </AspectRatio>
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
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={handleAddToFavorites} 
                      disabled={isAddingToFavorites}
                      className="w-full"
                    >
                      <Heart className="mr-2 h-4 w-4" /> 
                      Add to Favorites
                    </Button>
                    
                    {session?.user && (
                      <>
                        <BookmarkButton 
                          bookId={id!} 
                          userId={session.user.id} 
                          currentPage={currentPage}
                          existingBookmark={bookmark}
                          onBookmarkUpdated={() => refetchBookmark()}
                        />
                        
                        {!readingHistory && (
                          <CompleteBookButton 
                            bookId={id!}
                            userId={session.user.id}
                            onComplete={() => refetchHistory()}
                          />
                        )}
                      </>
                    )}
                    
                    {book.file_url && (
                      <Button asChild variant="outline" className="w-full">
                        <a href={book.file_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" /> Open PDF
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {readingHistory && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <BookOpenText className="mr-2 h-4 w-4" /> Reading Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">
                    <span className="font-medium">Completed:</span>{" "}
                    {new Date(readingHistory.completed_at).toLocaleDateString()}
                  </p>
                  
                  {readingHistory.rating && (
                    <div className="mb-2">
                      <span className="text-sm font-medium">Your Rating: </span>
                      <RatingStars rating={readingHistory.rating} maxRating={5} />
                    </div>
                  )}
                  
                  {readingHistory.review && (
                    <div>
                      <span className="text-sm font-medium">Your Review:</span>
                      <p className="text-sm mt-1 italic">"{readingHistory.review}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{book.description}</p>
              </CardContent>
            </Card>
            
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Page {currentPage} of {bookPages.length || '?'}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handlePageChange('prev')}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handlePageChange('next')}
                    disabled={currentPage >= bookPages.length}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {bookPages.length > 0 ? (
                  <div className="relative bg-white rounded-md shadow p-6 min-h-[400px]">
                    <BookPageContent content={currentPageContent?.content || "No content available for this page."} />
                  </div>
                ) : (
                  book.file_url ? (
                    <div className="relative w-full h-[600px] bg-white rounded-md shadow-sm">
                      <iframe
                        src={book.file_url}
                        title={book.title}
                        className="w-full h-full rounded-md"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                  ) : (
                    <div className="text-center p-10 border border-dashed rounded-md">
                      <BookOpen className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">
                        This book doesn't have any pages or external file.
                      </p>
                    </div>
                  )
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {bookPages.length > 0 ? (
                    <>Reading page {currentPage} of {bookPages.length}</>
                  ) : (
                    <>Book content not available in pages format</>
                  )}
                </div>
                {session?.user && bookPages.length > 0 && (
                  <BookmarkButton 
                    bookId={id!} 
                    userId={session.user.id} 
                    currentPage={currentPage} 
                    variant="ghost"
                    size="sm"
                    buttonText=""
                    existingBookmark={bookmark}
                    onBookmarkUpdated={() => refetchBookmark()}
                  />
                )}
              </CardFooter>
            </Card>
            
            {book.file_url && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>PDF View</CardTitle>
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
