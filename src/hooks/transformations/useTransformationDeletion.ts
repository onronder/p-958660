
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Transformation } from "@/types/transformation";

export const useTransformationDeletion = (
  setTransformations: React.Dispatch<React.SetStateAction<Transformation[]>>
) => {
  const { toast } = useToast();

  const deleteTransformation = async (transformationId: string) => {
    try {
      const { error } = await supabase.functions.invoke("delete-transformation", {
        body: { id: transformationId }
      });
      
      if (error) throw error;
      
      // Update local state
      setTransformations((prev) => prev.filter(t => t.id !== transformationId));
      
      toast({
        title: "Transformation Deleted",
        description: "The transformation has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting transformation:", error);
      toast({
        title: "Error",
        description: "Failed to delete transformation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { deleteTransformation };
};
