
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TransformationField, DerivedColumn } from "@/types/transformation";

export const useTransformationPreview = () => {
  const { toast } = useToast();
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Generate preview data
  const generatePreview = async (
    sourceId: string,
    fields: any[],
    derivedColumns: DerivedColumn[],
    skipTransformation: boolean,
    validateFn: () => boolean
  ) => {
    if (!validateFn()) return;
    
    setIsLoadingPreview(true);
    setShowPreview(false);
    
    try {
      const transformationData = {
        source_id: sourceId,
        fields: fields.filter(f => f.selected).map(f => ({ 
          name: f.name, 
          alias: f.alias 
        })),
        derived_columns: derivedColumns,
        skip_transformation: skipTransformation
      };
      
      const { data, error } = await supabase.functions.invoke("apply-transformation", {
        body: { 
          transformation: transformationData,
          preview: true,
          limit: 10
        }
      });
      
      if (error) throw error;
      
      setPreviewData(data.result || []);
      setShowPreview(true);
      return data.result || [];
    } catch (error) {
      console.error("Error generating preview:", error);
      toast({
        title: "Preview Error",
        description: error instanceof Error ? error.message : "Failed to generate preview.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoadingPreview(false);
    }
  };

  return {
    previewData,
    showPreview,
    isLoadingPreview,
    generatePreview,
    setShowPreview
  };
};
