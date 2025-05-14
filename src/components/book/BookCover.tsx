
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { BookOpen } from "lucide-react";

interface BookCoverProps {
  coverUrl?: string;
  title: string;
}

export const BookCover = ({ coverUrl, title }: BookCoverProps) => {
  if (coverUrl) {
    return (
      <AspectRatio ratio={2/3} className="bg-muted overflow-hidden rounded-md">
        <img 
          src={coverUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </AspectRatio>
    );
  }
  
  return (
    <AspectRatio ratio={2/3}>
      <div className="aspect-[2/3] bg-muted rounded-md flex items-center justify-center">
        <BookOpen size={64} className="text-muted-foreground" />
      </div>
    </AspectRatio>
  );
};
