
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BookGrid from "@/components/BookGrid";
import { 
  BookOpen, 
  BookCheck, 
  Bookmark, 
  BookText,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HistoryTable } from "@/components/HistoryTable";
import { BookRecommendations } from "@/components/BookRecommendations";

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("history");

  // Get user session
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (session === null) {
      navigate("/login");
    }
  }, [session, navigate]);

  // Fetch user's reading history
  const { data: readingHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ["reading-history", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reading_history")
        .select(`*, books:book_id(*)`)
        .eq("user_id", session!.user.id);

      if (error) throw new Error(error.message);
      
      return data.map(item => ({
        ...item,
        book: {
          ...item.books,
          cover_image: item.books.cover_url,
          category: item.books.genre
        } as Book
      }));
    },
    enabled: !!session?.user,
  });

  // Fetch user's bookmarks
  const { data: bookmarks = [], isLoading: isLoadingBookmarks } = useQuery({
    queryKey: ["bookmarks", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookmarks")
        .select(`*, books:book_id(*)`)
        .eq("user_id", session!.user.id);

      if (error) throw new Error(error.message);
      
      return data.map(item => ({
        ...item,
        book: {
          ...item.books,
          cover_image: item.books.cover_url,
          category: item.books.genre
        } as Book
      }));
    },
    enabled: !!session?.user,
  });

  // Fetch user's favorites
  const { data: favorites = [], isLoading: isLoadingFavorites } = useQuery({
    queryKey: ["favorites", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select(`*, books:book_id(*)`)
        .eq("user_id", session!.user.id);

      if (error) throw new Error(error.message);
      
      return data.map(item => ({
        ...item,
        book: {
          ...item.books,
          cover_image: item.books.cover_url,
          category: item.books.genre
        } as Book
      }));
    },
    enabled: !!session?.user,
  });

  if (!session) {
    return null; // Will redirect to login
  }

  const favoriteBooks = favorites.map(fav => fav.book);
  const bookmarkedBooks = bookmarks.map(bookmark => ({ 
    ...bookmark.book,
    page_number: bookmark.page_number 
  }));
  const completedBooks = readingHistory.map(history => ({
    ...history.book,
    completed_at: history.completed_at,
    rating: history.rating
  }));

  const getUserInitials = () => {
    if (!session?.user?.email) return "U";
    return session.user.email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <Avatar className="h-16 w-16 mr-4">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">{session.user.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-3">
              <div className="flex items-center">
                <BookText className="h-6 w-6 mr-2 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Favorites</p>
                  <p className="text-xl font-bold">{favoriteBooks.length}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center">
                <Bookmark className="h-6 w-6 mr-2 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Bookmarks</p>
                  <p className="text-xl font-bold">{bookmarkedBooks.length}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center">
                <BookCheck className="h-6 w-6 mr-2 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-xl font-bold">{completedBooks.length}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="history">
              <BookCheck className="mr-2 h-4 w-4" /> Reading History
            </TabsTrigger>
            <TabsTrigger value="bookmarks">
              <Bookmark className="mr-2 h-4 w-4" /> Bookmarks
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <BookText className="mr-2 h-4 w-4" /> Favorites
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <BookOpen className="mr-2 h-4 w-4" /> Recommendations
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Reading History</CardTitle>
                <CardDescription>
                  Books you've completed reading
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingHistory ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : completedBooks.length === 0 ? (
                  <div className="text-center py-12">
                    <BookCheck className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium mb-1">No completed books yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Mark books as completed to track your reading history
                    </p>
                    <Button onClick={() => navigate("/")}>Browse Books</Button>
                  </div>
                ) : (
                  <HistoryTable books={completedBooks} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bookmarks">
            <Card>
              <CardHeader>
                <CardTitle>Bookmarked Books</CardTitle>
                <CardDescription>
                  Continue reading where you left off
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingBookmarks ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : bookmarkedBooks.length === 0 ? (
                  <div className="text-center py-12">
                    <Bookmark className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium mb-1">No bookmarks yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Bookmark pages as you read to continue later
                    </p>
                    <Button onClick={() => navigate("/")}>Browse Books</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {bookmarkedBooks.map((book) => (
                      <Card key={book.id} className="flex overflow-hidden">
                        <div className="w-24 h-32 bg-muted shrink-0">
                          {book.cover_image || book.cover_url ? (
                            <img
                              src={book.cover_image || book.cover_url}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-grow">
                          <h3 className="font-semibold mb-1">{book.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">By {book.author}</p>
                          <p className="text-sm mb-3">
                            <Bookmark className="inline h-3 w-3 mr-1" /> Page {book.page_number}
                          </p>
                          <Button size="sm" onClick={() => navigate(`/read/${book.id}`)}>
                            Continue Reading
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Favorite Books</CardTitle>
                <CardDescription>
                  Books you've added to your favorites
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingFavorites ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : favoriteBooks.length === 0 ? (
                  <div className="text-center py-12">
                    <BookText className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium mb-1">No favorite books yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add books to your favorites for easy access
                    </p>
                    <Button onClick={() => navigate("/")}>Browse Books</Button>
                  </div>
                ) : (
                  <BookGrid books={favoriteBooks} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recommendations">
            <BookRecommendations 
              userId={session.user.id} 
              readingHistory={readingHistory}
              favorites={favorites}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
