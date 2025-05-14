
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { BookPageContent } from "@/components/BookPageContent";
import { PageNavigation } from "./PageNavigation";
import { BookmarkButton } from "@/components/BookmarkButton";

interface BookContentProps {
  bookId: string;
  userId?: string;
  title: string;
  currentPage: number;
  totalPages: number;
  pageContent: any;
  fileUrl?: string;
  bookmark: any;
  onPageChange: (direction: 'prev' | 'next') => void;
  onBookmarkUpdated: () => void;
}

export const BookContent = ({
  bookId,
  userId,
  title,
  currentPage,
  totalPages,
  pageContent,
  fileUrl,
  bookmark,
  onPageChange,
  onBookmarkUpdated
}: BookContentProps) => {
  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Page {currentPage} of {totalPages || '?'}</CardTitle>
          <PageNavigation 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={onPageChange} 
          />
        </CardHeader>
        <CardContent>
          {totalPages > 0 ? (
            <div className="relative bg-white rounded-md shadow p-6 min-h-[400px]">
              <BookPageContent content={pageContent?.content || "No content available for this page."} />
            </div>
          ) : (
            fileUrl ? (
              <div className="relative w-full h-[600px] bg-white rounded-md shadow-sm">
                <iframe
                  src={fileUrl}
                  title={title}
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
            {totalPages > 0 ? (
              <>Reading page {currentPage} of {totalPages}</>
            ) : (
              <>Book content not available in pages format</>
            )}
          </div>
          {userId && totalPages > 0 && (
            <BookmarkButton 
              bookId={bookId} 
              userId={userId} 
              currentPage={currentPage} 
              variant="ghost"
              size="sm"
              buttonText=""
              existingBookmark={bookmark}
              onBookmarkUpdated={onBookmarkUpdated}
            />
          )}
        </CardFooter>
      </Card>
      
      {fileUrl && (
        <Card>
          <CardHeader>
            <CardTitle>PDF View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-[600px] bg-white rounded-md shadow-sm">
              <iframe
                src={fileUrl}
                title={title}
                className="w-full h-full rounded-md"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
