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
  LibraryBig
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { HistoryTable } from "@/components/HistoryTable";
import { BookRecommendations } from "@/components/BookRecommendations";
import { Trash2 } from "lucide-react";

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
  const { data: bookmarks = [], isLoading: isLoadingBookmarks, refetch: refetchBookmarks } = useQuery({
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
          category: item.books.genre,
          bookmark_page: item.page_number, // Add bookmark page to book object
          bookmark_id: item.id // Add bookmark id for deletion
        } as Book & { bookmark_page: number, bookmark_id: string }
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
  const bookmarkedBooks = bookmarks.map(bookmark => bookmark.book);
  const completedBooks = readingHistory.map(history => ({
    ...history.book,
    completed_at: history.completed_at,
    rating: history.rating
  }));

  // Filter stored books (with bookmarks)
  const storedBooks = bookmarkedBooks.filter(book => book.bookmark_page);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <UserAvatar 
              userId={session.user.id}
              email={session.user.email}
              avatarUrl={session.user.user_metadata?.avatar_url}
              size="xl"
              editable={true}
            />
            <div className="ml-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">My Profile</h1>
              <p className="text-muted-foreground">{session.user.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-3 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/30">
              <div className="flex items-center">
                <BookText className="h-6 w-6 mr-2 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Favorites</p>
                  <p className="text-xl font-bold">{favoriteBooks.length}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3 bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/30">
              <div className="flex items-center">
                <Bookmark className="h-6 w-6 mr-2 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Bookmarks</p>
                  <p className="text-xl font-bold">{bookmarkedBooks.length}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/30">
              <div className="flex items-center">
                <BookCheck className="h-6 w-6 mr-2 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-xl font-bold">{completedBooks.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-3 bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/30">
              <div className="flex items-center">
                <LibraryBig className="h-6 w-6 mr-2 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Stored</p>
                  <p className="text-xl font-bold">{storedBooks.length}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-secondary/50 p-1 rounded-full">
            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full">
              <BookCheck className="mr-2 h-4 w-4" /> Reading History
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full">
              <Bookmark className="mr-2 h-4 w-4" /> Bookmarks
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full">
              <BookText className="mr-2 h-4 w-4" /> Favorites
            </TabsTrigger>
            <TabsTrigger value="stored" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full">
              <LibraryBig className="mr-2 h-4 w-4" /> Stored Books
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full">
              <BookOpen className="mr-2 h-4 w-4" /> Recommendations
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="history">
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/30 rounded-t-lg">
                <CardTitle>Reading History</CardTitle>
                <CardDescription>
                  Books you've completed reading
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
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
                    <Button onClick={() => navigate("/")} className="rounded-full">Browse Books</Button>
                  </div>
                ) : (
                  <HistoryTable books={completedBooks} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bookmarks">
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/30 rounded-t-lg">
                <CardTitle>Bookmarked Books</CardTitle>
                <CardDescription>
                  Continue reading where you left off
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
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
                    <Button onClick={() => navigate("/")} className="rounded-full">Browse Books</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {bookmarkedBooks.map((book) => (
                      <Card key={book.id} className="flex overflow-hidden book-card bg-gradient-to-r from-blue-50 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/30">
                        <div className="w-24 h-32 bg-muted shrink-0 m-3 rounded overflow-hidden">
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
                          <p className="text-sm mb-3 flex items-center">
                            <Bookmark className="inline h-3 w-3 mr-1 text-primary" /> 
                            <span className="font-medium">Current page:</span> {book.bookmark_page}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => navigate(`/read/${book.id}`)} 
                              className="rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700"
                            >
                              Continue Reading
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              className="rounded-full text-destructive hover:bg-destructive/10"
                              onClick={async () => {
                                try {
                                  await supabase
                                    .from("bookmarks")
                                    .delete()
                                    .eq("id", book.bookmark_id);
                                    
                                  refetchBookmarks();
                                } catch (error) {
                                  console.error("Failed to delete bookmark:", error);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/30 rounded-t-lg">
                <CardTitle>Favorite Books</CardTitle>
                <CardDescription>
                  Books you've added to your favorites
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
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
                    <Button onClick={() => navigate("/")} className="rounded-full">Browse Books</Button>
                  </div>
                ) : (
                  <BookGrid books={favoriteBooks} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Stored Books Tab */}
          <TabsContent value="stored">
            <Card>
              <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/30 rounded-t-lg">
                <CardTitle>Stored Books</CardTitle>
                <CardDescription>
                  Books you're currently reading with saved progress
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoadingBookmarks ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : storedBooks.length === 0 ? (
                  <div className="text-center py-12">
                    <LibraryBig className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium mb-1">No stored books yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Books you're reading will appear here with your reading progress
                    </p>
                    <Button onClick={() => navigate("/")} className="rounded-full">Browse Books</Button>
                  </div>
                ) : (
                  <BookGrid 
                    books={storedBooks} 
                    isStored={true} 
                    onBookDeleted={() => refetchBookmarks()}
                  />
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
