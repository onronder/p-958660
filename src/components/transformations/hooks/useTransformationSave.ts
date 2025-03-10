
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Transformation } from "@/types/transformation";

interface UseTransformationSaveProps {
  transformation: Transformation | undefined;
  name: string;
  sourceId: string;
  skipTransformation: boolean;
  fields: any[];
  derivedColumns: any[];
  onSave: (transformation: Transformation) => void;
  onClose: () => void;
}

export const useTransformationSave = ({
  transformation,
  name,
  sourceId,
  skipTransformation,
  fields,
  derivedColumns,
  onSave,
  onClose
}: UseTransformationSaveProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Save transformation
  const handleSave = async (validateFn: () => boolean) => {
    if (!validateFn()) return;
    
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a name for the transformation.",
        variant: "destructive",
      });
      return;
    }
    
    if (!sourceId) {
      toast({
        title: "Validation Error",
        description: "Please select a data source.",
        variant: "destructive",
      });
      return;
    }
    
    // Prepare transformation data
    const transformationData: Partial<Transformation> = {
      id: transformation?.id,
      name: name.trim(),
      source_id: sourceId,
      status: transformation?.status || "Active",
      skip_transformation: skipTransformation,
      fields: fields.filter(f => f.selected).map(f => ({ 
        name: f.name, 
        alias: f.alias 
      })) as any,
      derived_columns: derivedColumns as any
    };
    
    try {
      setIsLoading(true);
      onSave(transformationData as Transformation);
    } catch (error) {
      console.error("Error saving transformation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSave
  };
};
