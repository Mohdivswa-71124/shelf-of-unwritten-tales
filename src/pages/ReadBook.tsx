
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { 
  useBookData, 
  useBookPages, 
  useCategories,
  useBookmark, 
  useReadingHistory 
} from "@/hooks/useBookData";
import { useSession } from "@/hooks/useSession";
import { BookSidebar } from "@/components/book/BookSidebar";
import { BookDetails } from "@/components/book/BookDetails";
import { BookContent } from "@/components/book/BookContent";

const ReadBook = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Get user session
  const { data: session } = useSession();
  
  // Fetch book data
  const { data: book, isLoading: isLoadingBook } = useBookData(id);
  const { data: bookPages = [], isLoading: isLoadingPages } = useBookPages(id);
  const { data: categories = [] } = useCategories();
  const { data: bookmark, refetch: refetchBookmark } = useBookmark(id, session?.user?.id);
  const { data: readingHistory, refetch: refetchHistory } = useReadingHistory(id, session?.user?.id);

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
  
  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < bookPages.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const currentPageContent = bookPages.find(p => p.page_number === currentPage);
  const totalPages = bookPages.length;
  
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
              <Button variant="default" onClick={() => navigate('/')} className="rounded-full">
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
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2 rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold truncate bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {book.title}
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <BookSidebar
              book={book}
              categoryName={categoryName}
              currentPage={currentPage}
              totalPages={totalPages}
              bookmark={bookmark}
              readingHistory={readingHistory}
              userId={session?.user?.id}
              onBookmarkUpdated={refetchBookmark}
              onHistoryUpdated={refetchHistory}
            />
          </div>
          
          <div className="md:col-span-2">
            <BookDetails book={book} />
            
            <BookContent
              bookId={id!}
              userId={session?.user?.id}
              title={book.title}
              currentPage={currentPage}
              totalPages={totalPages}
              pageContent={currentPageContent}
              fileUrl={book.file_url}
              bookmark={bookmark}
              onPageChange={handlePageChange}
              onBookmarkUpdated={refetchBookmark}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadBook;
