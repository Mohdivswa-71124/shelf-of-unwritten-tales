
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book } from "@/types/book";
import { BookCover } from "./BookCover";
import { BookActions } from "./BookActions";
import { ReadingStatus } from "./ReadingStatus";

interface BookSidebarProps {
  book: Book;
  categoryName: string;
  currentPage: number;
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
  bookmark, 
  readingHistory,
  userId,
  onBookmarkUpdated,
  onHistoryUpdated
}: BookSidebarProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <BookCover 
            coverUrl={book.cover_image || book.cover_url} 
            title={book.title} 
          />
          
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
