
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book } from "@/types/book";
import { BookCover } from "./BookCover";
import { BookActions } from "./BookActions";
import { ReadingStatus } from "./ReadingStatus";
import { Progress } from "@/components/ui/progress";

interface BookSidebarProps {
  book: Book;
  categoryName: string;
  currentPage: number;
  totalPages: number;
  bookmark: any;
  readingHistory: any;
  userId?: string;
  onBookmarkUpdated: () => void;
  onHistoryUpdated: () => void;
}

export const BookSidebar = ({ 
  book, 
  categoryName, 
  currentPage, 
  totalPages,
  bookmark, 
  readingHistory,
  userId,
  onBookmarkUpdated,
  onHistoryUpdated
}: BookSidebarProps) => {
  // Calculate reading progress
  const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;
  
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-secondary/70 to-background">
        <CardContent className="p-4">
          <BookCover 
            coverUrl={book.cover_image || book.cover_url} 
            title={book.title} 
          />
          
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-medium text-muted-foreground">Author</h3>
              <p className="font-medium">{book.author}</p>
            </div>
            
            {book.publication_year && (
              <div>
                <h3 className="font-medium text-muted-foreground">Published</h3>
                <p>{book.publication_year}</p>
              </div>
            )}
            
            <div>
              <h3 className="font-medium text-muted-foreground">Category</h3>
              <Badge variant="outline" className="bg-primary/10">{categoryName}</Badge>
            </div>
            
            <div className="pt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Reading Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-background" />
              <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                <span>Page {currentPage}</span>
                <span>of {totalPages}</span>
              </div>
            </div>
            
            <BookActions 
              bookId={book.id}
              userId={userId}
              currentPage={currentPage}
              bookmark={bookmark}
              readingHistory={readingHistory}
              fileUrl={book.file_url}
              onBookmarkUpdated={onBookmarkUpdated}
              onHistoryUpdated={onHistoryUpdated}
            />
          </div>
        </CardContent>
      </Card>
      
      {readingHistory && (
        <ReadingStatus readingHistory={readingHistory} />
      )}
    </div>
  );
};
