
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Transformation, TransformationStatus } from "@/types/transformation";

export const useTransformations = () => {
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchTransformations = async () => {
    try {
      setIsLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from('transformations')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Cast the status to TransformationStatus when setting state
      const typedData = data?.map(item => ({
        ...item,
        status: item.status as TransformationStatus,
      })) as Transformation[] || [];
      
      setTransformations(typedData);
    } catch (err) {
      console.error("Error fetching transformations:", err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast({
        title: "Error",
        description: "Failed to load transformations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransformations();
  }, [toast]);

  // Add missing methods
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

  const applyTransformation = async (transformationId: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke("apply-transformation", {
        body: { id: transformationId }
      });
      
      if (error) throw error;
      
      toast({
        title: "Transformation Applied",
        description: "The transformation has been applied successfully.",
      });
      
      return data;
    } catch (error) {
      console.error("Error applying transformation:", error);
      toast({
        title: "Error",
        description: "Failed to apply transformation. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    transformations, 
    isLoading, 
    error,
    saveTransformation,
    deleteTransformation,
    toggleTransformationStatus,
    applyTransformation
  };
};
