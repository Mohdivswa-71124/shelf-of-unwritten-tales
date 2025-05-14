
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";

export function useBookData(id: string | undefined) {
  return useQuery({
    queryKey: ["book", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw new Error(error.message);
      
      return {
        ...data,
        cover_image: data.cover_url,
        category: data.genre
      } as Book;
    },
    enabled: !!id,
  });
}

export function useBookPages(id: string | undefined) {
  return useQuery({
    queryKey: ["book-pages", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_pages")
        .select("*")
        .eq("book_id", id)
        .order("page_number", { ascending: true });
      
      if (error) throw new Error(error.message);
      
      return data || [];
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*");
      return data || [];
    },
  });
}

export function useBookmark(id: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ["bookmark", id, userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("book_id", id)
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error) throw new Error(error.message);
      
      return data;
    },
    enabled: !!id && !!userId,
  });
}

export function useReadingHistory(id: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ["reading-history", id, userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("reading_history")
        .select("*")
        .eq("book_id", id)
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error) throw new Error(error.message);
      
      return data;
    },
    enabled: !!id && !!userId,
  });
}
