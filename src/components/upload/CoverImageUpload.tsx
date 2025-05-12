
import React, { useState } from "react";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface CoverImageUploadProps {
  onChange: (file: File) => void;
}

const CoverImageUpload: React.FC<CoverImageUploadProps> = ({ onChange }) => {
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
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
  );
};

export default CoverImageUpload;
