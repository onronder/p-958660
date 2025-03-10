
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Transformation, TransformationStatus } from "@/types/transformation";

export const useTransformationMutations = (
  setTransformations: React.Dispatch<React.SetStateAction<Transformation[]>>
) => {
  const { toast } = useToast();

  const saveTransformation = async (transformation: Transformation) => {
    try {
      let result;
      
      if (transformation.id) {
        // Update existing transformation
        const { data, error } = await supabase.functions.invoke("update-transformation", {
          body: transformation
        });
        
        if (error) throw error;
        result = data.transformation;
        
        // Update in local state
        setTransformations((prev) => 
          prev.map(t => t.id === transformation.id ? {...result, status: result.status as TransformationStatus} : t)
        );
      } else {
        // Create new transformation
        const { data, error } = await supabase.functions.invoke("create-transformation", {
          body: transformation
        });
        
        if (error) throw error;
        result = data.transformation;
        
        // Add to local state
        setTransformations((prev) => [...prev, {...result, status: result.status as TransformationStatus}]);
      }
      
      toast({
        title: "Success",
        description: `Transformation ${transformation.id ? 'updated' : 'created'} successfully.`,
      });
      
      return result;
    } catch (error) {
      console.error("Error saving transformation:", error);
      toast({
        title: "Error",
        description: "Failed to save transformation. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { saveTransformation };
};
