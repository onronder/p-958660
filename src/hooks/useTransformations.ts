
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Transformation } from "@/types/transformation";
import { supabase } from "@/integrations/supabase/client";

export const useTransformations = () => {
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadTransformations();
    }
  }, [user]);

  const loadTransformations = async () => {
    try {
      setIsLoading(true);
      
      if (!user) {
        return;
      }
      
      // In a real implementation, we would fetch from the database
      // const { data, error } = await supabase
      //   .from('transformations')
      //   .select('*')
      //   .eq('user_id', user.id);
      
      // if (error) throw error;
      
      // For now, we'll use mock data extending the existing sample
      const mockTransformations: Transformation[] = [
        {
          id: "1",
          name: "Order Transformation",
          source_id: "shopify-source",
          source_name: "Orders",
          status: "Active",
          last_modified: "2023-11-22",
          user_id: user.id
        },
        {
          id: "2",
          name: "Customer Insights",
          source_id: "customers-source",
          source_name: "Customers",
          status: "Inactive",
          last_modified: "2023-11-20",
          user_id: user.id
        },
        {
          id: "3",
          name: "Tax Calculation",
          source_id: "shopify-source",
          source_name: "Orders",
          status: "Active",
          last_modified: "2023-12-05",
          expression: "total_price * 1.2",
          user_id: user.id
        }
      ];
      
      setTransformations(mockTransformations);
    } catch (error) {
      console.error("Error fetching transformations:", error);
      toast({
        title: "Error",
        description: "Failed to load transformations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        setTransformations(prev => 
          prev.map(t => t.id === transformation.id ? transformation : t)
        );
      } else {
        // Add new transformation
        setTransformations(prev => [...prev, transformation]);
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
      setTransformations(prev => prev.filter(t => t.id !== transformationId));
      
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
      setTransformations(prev => 
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

  const applyTransformation = async (transformationId: string) => {
    try {
      toast({
        title: "Applying Transformation",
        description: "Please wait while we process your data.",
      });
      
      // In a real implementation, we would call the API
      // const { data, error } = await supabase.functions.invoke("apply-transformation", {
      //   body: { transformation_id: transformationId }
      // });
      
      // if (error) throw error;
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Transformation Applied",
        description: "Your data has been processed successfully.",
      });
    } catch (error) {
      console.error("Error applying transformation:", error);
      toast({
        title: "Error",
        description: "Failed to apply transformation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    transformations,
    isLoading,
    loadTransformations,
    saveTransformation,
    deleteTransformation,
    toggleTransformationStatus,
    applyTransformation
  };
};
