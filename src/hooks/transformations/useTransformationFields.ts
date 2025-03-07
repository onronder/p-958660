
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Transformation, TransformationField } from "@/types/transformation";

export const useTransformationFields = (transformation?: Transformation) => {
  const { toast } = useToast();
  const [fields, setFields] = useState<any[]>([]);
  const [isLoadingFields, setIsLoadingFields] = useState(false);

  // Load fields from a selected source
  const loadSourceFields = async (sourceId: string) => {
    if (!sourceId) return;
    
    setIsLoadingFields(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-source-fields", {
        body: { source_id: sourceId }
      });
      
      if (error) throw error;
      
      const fieldsWithSelection = data.fields.map((field: any) => ({
        name: field.name,
        type: field.type,
        selected: transformation && transformation.fields
          ? transformation.fields.some((f: TransformationField) => f.name === field.name)
          : true,
        alias: transformation?.fields?.find((f: TransformationField) => f.name === field.name)?.alias || field.name
      }));
      
      setFields(fieldsWithSelection);
      return fieldsWithSelection;
    } catch (error) {
      console.error("Error loading source fields:", error);
      toast({
        title: "Error",
        description: "Failed to load source fields.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoadingFields(false);
    }
  };

  // Toggle field selection
  const toggleFieldSelection = (fieldName: string) => {
    setFields(prevFields => 
      prevFields.map(field => 
        field.name === fieldName 
          ? { ...field, selected: !field.selected } 
          : field
      )
    );
  };

  // Update field alias
  const updateFieldAlias = (fieldName: string, alias: string) => {
    setFields(prevFields => 
      prevFields.map(field => 
        field.name === fieldName 
          ? { ...field, alias } 
          : field
      )
    );
  };

  return {
    fields,
    setFields,
    isLoadingFields,
    loadSourceFields,
    toggleFieldSelection,
    updateFieldAlias
  };
};
