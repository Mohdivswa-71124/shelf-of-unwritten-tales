
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookFormData } from "@/types/book";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CoverImageUpload from "./CoverImageUpload";
import BookFileUpload from "./BookFileUpload";
import CategorySelect from "./CategorySelect";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  cover_image: z.any().optional(),
  book_file: z.any().refine(val => val?.length > 0, "Book file is required"),
});

const BookUploadForm: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  
  const form = useForm<BookFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      category: "",
    },
  });
  
  const categories = ["Fiction", "History", "Mystery", "Non-fiction", "Science"];
  
  const uploadMutation = useMutation({
    mutationFn: async (data: BookFormData) => {
      setUploading(true);
      
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to upload books");
      }
      
      let cover_url = null;
      let file_url = null;
      
      // Upload cover image if provided
      if (data.cover_image) {
        const coverFile = data.cover_image;
        const coverExt = coverFile.name.split('.').pop();
        const coverFileName = `${Date.now()}-cover.${coverExt}`;
        
        const { error: coverUploadError, data: coverData } = await supabase.storage
          .from("book_covers")
          .upload(coverFileName, coverFile);
          
        if (coverUploadError) {
          throw new Error(`Error uploading cover: ${coverUploadError.message}`);
        }
        
        const { data: coverUrlData } = supabase.storage
          .from("book_covers")
          .getPublicUrl(coverFileName);
          
        cover_url = coverUrlData.publicUrl;
      }
      
      // Upload book file
      if (data.book_file) {
        const bookFile = data.book_file;
        const bookExt = bookFile.name.split('.').pop();
        const bookFileName = `${Date.now()}-book.${bookExt}`;
        
        const { error: bookUploadError, data: bookData } = await supabase.storage
          .from("books")
          .upload(bookFileName, bookFile);
          
        if (bookUploadError) {
          throw new Error(`Error uploading book: ${bookUploadError.message}`);
        }
        
        const { data: bookUrlData } = supabase.storage
          .from("books")
          .getPublicUrl(bookFileName);
          
        file_url = bookUrlData.publicUrl;
      }
      
      // Get the current year for publication_year
      const currentYear = new Date().getFullYear();
      
      // Save book data to database, using fields that match the database schema
      const { error } = await supabase.from("books").insert({
        title: data.title,
        author: data.author,
        description: data.description,
        genre: data.category, // Map category to genre
        cover_url: cover_url, // Use cover_url instead of cover_image
        file_url,
        created_by: user.id,
        publication_year: currentYear, // Required by database schema
      });
      
      if (error) {
        throw new Error(`Error saving book: ${error.message}`);
      }
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Book uploaded successfully",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUploading(false);
    },
  });
  
  const onSubmit = (data: BookFormData) => {
    uploadMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter book title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author</FormLabel>
              <FormControl>
                <Input placeholder="Enter author name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <CategorySelect form={form} categories={categories} />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter book description" 
                  {...field} 
                  className="min-h-24"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <CoverImageUpload 
              onChange={(file) => form.setValue("cover_image", file)} 
            />
          </div>
          
          <div>
            <BookFileUpload 
              onChange={(file) => form.setValue("book_file", file)}
              error={form.formState.errors.book_file?.message as string}
            />
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload Book"}
        </Button>
      </form>
    </Form>
  );
};

export default BookUploadForm;
