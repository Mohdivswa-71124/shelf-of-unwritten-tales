
import React from "react";
import { Book } from "@/types/book";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/RatingStars";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ExtendedBook extends Book {
  completed_at: string;
  rating?: number;
}

interface HistoryTableProps {
  books: ExtendedBook[];
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ books }) => {
  const navigate = useNavigate();
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Cover</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Author</TableHead>
            <TableHead className="hidden md:table-cell">Completed Date</TableHead>
            <TableHead className="hidden md:table-cell">Rating</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.id}>
              <TableCell>
                <div className="w-12 h-16 bg-muted rounded overflow-hidden">
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
              </TableCell>
              <TableCell className="font-medium">{book.title}</TableCell>
              <TableCell className="hidden md:table-cell">{book.author}</TableCell>
              <TableCell className="hidden md:table-cell">
                {new Date(book.completed_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {book.rating ? (
                  <RatingStars rating={book.rating} maxRating={5} />
                ) : (
                  <span className="text-sm text-muted-foreground">Not rated</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" onClick={() => navigate(`/read/${book.id}`)}>
                  Read Again
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
