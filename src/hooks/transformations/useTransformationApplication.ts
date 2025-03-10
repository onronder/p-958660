
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useTransformationApplication = () => {
  const { toast } = useToast();
  const [isApplying, setIsApplying] = useState(false);

  const applyTransformation = async (transformationId: string) => {
    try {
      setIsApplying(true);
      
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
      setIsApplying(false);
    }
  };

  return { 
    applyTransformation,
    isApplying
  };
};
