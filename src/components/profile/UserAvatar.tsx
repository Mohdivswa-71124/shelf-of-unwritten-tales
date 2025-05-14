
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserAvatarProps {
  userId: string;
  email?: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  editable?: boolean;
}

export const UserAvatar = ({
  userId,
  email = "",
  avatarUrl,
  size = "md",
  editable = false
}: UserAvatarProps) => {
  const [avatar, setAvatar] = useState<string | undefined>(avatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-16 w-16",
    lg: "h-24 w-24",
    xl: "h-32 w-32"
  };

  const getUserInitials = () => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };

  const uploadAvatar = async (file: File) => {
    try {
      setIsUploading(true);
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${uuidv4()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const avatarUrl = data.publicUrl;
      
      // Update user's profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      setAvatar(avatarUrl);
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated",
      });
      
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "File too large",
        description: "Profile picture must be less than 2MB",
        variant: "destructive",
      });
      return;
    }
    
    uploadAvatar(file);
  };

  const deleteAvatar = async () => {
    try {
      if (!avatar) return;
      
      // Extract file path from public URL
      const filePath = avatar.split('/').slice(-2).join('/');
      
      // Delete from Supabase Storage
      const { error: deleteError } = await supabase
        .storage
        .from('avatars')
        .remove([filePath]);
      
      if (deleteError) throw deleteError;
      
      // Update user's profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      setAvatar(undefined);
      
      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove profile picture",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative">
      <Avatar className={`${sizeClasses[size]} bg-primary text-primary-foreground`}>
        <AvatarImage src={avatar} alt={email} />
        <AvatarFallback className={size === "xl" ? "text-2xl" : "text-xl"}>
          {getUserInitials()}
        </AvatarFallback>
      </Avatar>
      
      {editable && (
        <div className="absolute bottom-0 right-0 flex gap-1">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="h-7 w-7 rounded-full bg-primary text-primary-foreground">
                <Camera className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update profile picture</DialogTitle>
                <DialogDescription>
                  Choose a new profile picture to upload. Max size 2MB.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex justify-center">
                  <Avatar className="h-24 w-24 bg-primary text-primary-foreground">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex justify-center">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button disabled={isUploading} className="rounded-full">
                      {isUploading ? "Uploading..." : "Select Image"}
                    </Button>
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {avatar && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="destructive" className="h-7 w-7 rounded-full">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove profile picture?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your current profile picture.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteAvatar}>
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}
    </div>
  );
};
