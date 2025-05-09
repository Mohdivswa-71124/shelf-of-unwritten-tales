
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BookFormData } from "@/types/book";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  cover_image: z.any().optional(),
  book_file: z.any().refine(val => val?.length > 0, "Book file is required"),
});

const Upload = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const form = useForm<BookFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      category: "",
    },
  });
  
  const uploadMutation = useMutation({
    mutationFn: async (data: BookFormData) => {
      setUploading(true);
      
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to upload books");
      }
      
      let cover_image_url = null;
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
        
        const { data: coverUrl } = supabase.storage
          .from("book_covers")
          .getPublicUrl(coverFileName);
          
        cover_image_url = coverUrl.publicUrl;
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
        
        const { data: bookUrl } = supabase.storage
          .from("books")
          .getPublicUrl(bookFileName);
          
        file_url = bookUrl.publicUrl;
      }
      
      // Save book data to database
      const { error } = await supabase.from("books").insert({
        title: data.title,
        author: data.author,
        description: data.description,
        category: data.category,
        cover_image: cover_image_url,
        file_url,
        user_id: user.id,
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
  
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("cover_image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onSubmit = (data: BookFormData) => {
    uploadMutation.mutate(data);
  };
  
  const categories = ["Fiction", "History", "Mystery", "Non-fiction", "Science"];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Upload a New Book</CardTitle>
        </CardHeader>
        <CardContent>
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
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                  <FormLabel>Cover Image (Optional)</FormLabel>
                  <div className="mt-2">
                    <Input
                      id="cover_image"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                    />
                  </div>
                  
                  {coverPreview && (
                    <div className="mt-4">
                      <div className="w-32 h-40 overflow-hidden border rounded">
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <FormLabel htmlFor="book_file">Book File (PDF, EPUB, etc.)</FormLabel>
                  <div className="mt-2">
                    <Input
                      id="book_file"
                      type="file"
                      accept=".pdf,.epub,.mobi,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) form.setValue("book_file", file);
                      }}
                    />
                  </div>
                  <FormMessage>{form.formState.errors.book_file?.message}</FormMessage>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Upload;
