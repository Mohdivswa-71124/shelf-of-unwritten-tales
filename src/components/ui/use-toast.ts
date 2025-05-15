
// Import directly from the original source
import { useToast as useToastOriginal } from "@/hooks/use-toast";
import { toast as toastOriginal } from "@/hooks/use-toast";

// Re-export
export const useToast = useToastOriginal; 
export const toast = toastOriginal;
