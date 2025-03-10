
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Transformation, TransformationStatus } from "@/types/transformation";

export const useTransformationStatus = (
  transformations: Transformation[],
  setTransformations: React.Dispatch<React.SetStateAction<Transformation[]>>
) => {
  const { toast } = useToast();

  const toggleTransformationStatus = async (transformationId: string) => {
    try {
      const transformation = transformations.find(t => t.id === transformationId);
      
      if (!transformation) {
        throw new Error("Transformation not found");
      }
      
      const newStatus = transformation.status === "Active" ? "Inactive" : "Active";
      
      const { data, error } = await supabase.functions.invoke("update-transformation", {
        body: { 
          id: transformationId,
          status: newStatus
        }
      });
      
      if (error) throw error;
      
      // Update local state
      setTransformations((prev) => 
        prev.map(t => t.id === transformationId ? { ...t, status: newStatus as TransformationStatus } : t)
      );
      
      toast({
        title: "Status Updated",
        description: `Transformation is now ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating transformation status:", error);
      toast({
        title: "Error",
        description: "Failed to update transformation status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { toggleTransformationStatus };
};
