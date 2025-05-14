
import React from "react";

interface BookPageContentProps {
  content: string;
}

export const BookPageContent: React.FC<BookPageContentProps> = ({ content }) => {
  return (
    <div className="prose max-w-none">
      {content.split('\n').map((paragraph, index) => (
        <p key={index} className="mb-4">
          {paragraph}
        </p>
      ))}
    </div>
  );
};
