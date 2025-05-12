
import React from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BookUploadForm from "@/components/upload/BookUploadForm";

const Upload: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Upload a New Book</CardTitle>
        </CardHeader>
        <CardContent>
          <BookUploadForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Upload;
