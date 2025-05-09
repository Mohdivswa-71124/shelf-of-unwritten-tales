
export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  cover_image?: string;
  file_url?: string;
  user_id: string;
  created_at: string;
}

export interface BookFormData {
  title: string;
  author: string;
  description: string;
  category: string;
  cover_image?: File;
  book_file?: File;
}
