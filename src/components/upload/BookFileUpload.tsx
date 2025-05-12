
import React from "react";
import { FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface BookFileUploadProps {
  onChange: (file: File) => void;
  error?: string;
}

const BookFileUpload: React.FC<BookFileUploadProps> = ({ onChange, error }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange(file);
  };

  return (
    <div>
      <FormLabel htmlFor="book_file">Book File (PDF, EPUB, etc.)</FormLabel>
      <div className="mt-2">
        <Input
          id="book_file"
          type="file"
          accept=".pdf,.epub,.mobi,.txt"
          onChange={handleFileChange}
        />
      </div>
      {error && <FormMessage>{error}</FormMessage>}
    </div>
  );
};

export default BookFileUpload;
