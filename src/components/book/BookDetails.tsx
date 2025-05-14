
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Book } from "@/types/book";

interface BookDetailsProps {
  book: Book;
}

export const BookDetails = ({ book }: BookDetailsProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Description</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line">{book.description}</p>
      </CardContent>
    </Card>
  );
};
