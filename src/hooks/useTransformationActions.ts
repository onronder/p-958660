
import { useToast } from "@/hooks/use-toast";
import { Transformation } from "@/types/transformation";

export const useTransformationActions = (
  transformations: Transformation[],
  setTransformations: React.Dispatch<React.SetStateAction<Transformation[]>>
) => {
  const { toast } = useToast();

  const saveTransformation = async (transformation: Transformation) => {
    try {
      // In a real implementation, we would save to the database
      // const { data, error } = await supabase
      //   .from('transformations')
      //   .upsert(transformation)
      //   .select();
      
      // if (error) throw error;
      
      // For now, we'll update the local state
      const existingIndex = transformations.findIndex(t => t.id === transformation.id);
      
      if (existingIndex >= 0) {
        // Update existing transformation
        setTransformations((prev: Transformation[]) => 
          prev.map(t => t.id === transformation.id ? transformation : t)
        );
      } else {
        // Add new transformation
        setTransformations((prev: Transformation[]) => [...prev, transformation]);
      }
      
      return transformation;
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
      // In a real implementation, we would delete from the database
      // const { error } = await supabase
      //   .from('transformations')
      //   .delete()
      //   .eq('id', transformationId);
      
      // if (error) throw error;
      
      // For now, we'll update the local state
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
      
      // In a real implementation, we would update the database
      // const { error } = await supabase
      //   .from('transformations')
      //   .update({ status: newStatus })
      //   .eq('id', transformationId);
      
      // if (error) throw error;
      
      // For now, we'll update the local state
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
