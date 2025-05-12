
export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category?: string;  // For backward compatibility
  genre?: string;     // From database
  cover_image?: string; // For backward compatibility
  cover_url?: string;   // From database
  file_url?: string;
  user_id?: string;
  created_by?: string;  // From database
  created_at?: string;
  publication_year?: number; // From database
}

export interface BookFormData {
  title: string;
  author: string;
  description: string;
  category: string;
  cover_image?: File;
  book_file?: File;
}
