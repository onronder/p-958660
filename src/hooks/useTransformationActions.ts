
import { useToast } from "@/hooks/use-toast";
import { Transformation } from "@/types/transformation";
import { supabase } from "@/integrations/supabase/client";

export const useTransformationActions = (
  transformations: Transformation[],
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
        setTransformations((prev: Transformation[]) => 
          prev.map(t => t.id === transformation.id ? result : t)
        );
      } else {
        // Create new transformation
        const { data, error } = await supabase.functions.invoke("create-transformation", {
          body: transformation
        });
        
        if (error) throw error;
        result = data.transformation;
        
        // Add to local state
        setTransformations((prev: Transformation[]) => [...prev, result]);
      }
      
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

  const deleteTransformation = async (transformationId: string) => {
    try {
      const { error } = await supabase.functions.invoke("delete-transformation", {
        body: { id: transformationId }
      });
      
      if (error) throw error;
      
      // Update local state
      setTransformations((prev: Transformation[]) => prev.filter(t => t.id !== transformationId));
      
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
      setTransformations((prev: Transformation[]) => 
        prev.map(t => t.id === transformationId ? { ...t, status: newStatus } : t)
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

  return {
    saveTransformation,
    deleteTransformation,
    toggleTransformationStatus
  };
};
