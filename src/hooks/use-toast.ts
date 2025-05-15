
import { toast as sonnerToast } from "sonner";
import {
  useToast as useToastShadcn
} from "@/components/ui/toast";

// Re-export the hooks with proper naming
export const useToast = useToastShadcn;
export const toast = sonnerToast;
