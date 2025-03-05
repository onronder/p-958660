
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useApplyTransformation = () => {
  const { toast } = useToast();

  const applyTransformation = async (transformationId: string) => {
    try {
      toast({
        title: "Applying Transformation",
        description: "Please wait while we process your data.",
      });
      
      const { data, error } = await supabase.functions.invoke("apply-transformation", {
        body: { transformation_id: transformationId }
      });
      
      if (error) throw error;
      
      toast({
        title: "Transformation Applied",
        description: "Your data has been processed successfully.",
      });
      
      return data.preview;
    } catch (error) {
      console.error("Error applying transformation:", error);
      toast({
        title: "Error",
        description: "Failed to apply transformation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportRawData = async (sourceId: string) => {
    try {
      toast({
        title: "Exporting Data",
        description: "Please wait while we export your data.",
      });
      
      const { data, error } = await supabase.functions.invoke("export-data", {
        body: { 
          source_id: sourceId,
          skip_transformation: true
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Data Exported",
        description: "Your data has been exported successfully.",
      });
      
      return data.data;
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { 
    applyTransformation,
    exportRawData
  };
};
