
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Transformation } from "@/types/transformation";
import { useTransformationSources } from "@/hooks/transformations/useTransformationSources";
import { useTransformationFields } from "@/hooks/transformations/useTransformationFields";
import { useTransformationDerivedColumns } from "@/hooks/transformations/useTransformationDerivedColumns";
import { useTransformationPreview } from "@/hooks/transformations/useTransformationPreview";

interface UseTransformationModalProps {
  transformation: Transformation | undefined;
  onSave: (transformation: Transformation) => void;
  onClose: () => void;
}

const useTransformationModal = ({
  transformation,
  onSave,
  onClose
}: UseTransformationModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("fields");
  const [name, setName] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [skipTransformation, setSkipTransformation] = useState(false);

  // Import the functionality from our new hooks
  const { sources, loadSources } = useTransformationSources();
  const { fields, loadSourceFields, toggleFieldSelection, updateFieldAlias } = useTransformationFields(transformation);
  const { 
    derivedColumns, 
    selectedFunction, 
    setSelectedFunction,
    addDerivedColumn, 
    removeDerivedColumn, 
    updateDerivedColumn, 
    insertFunctionToExpression 
  } = useTransformationDerivedColumns(transformation?.derived_columns || []);
  const { 
    previewData, 
    showPreview, 
    isLoadingPreview, 
    generatePreview 
  } = useTransformationPreview();

  // Initialize form with transformation data if editing
  useEffect(() => {
    if (transformation) {
      setName(transformation.name || "");
      setSourceId(transformation.source_id || "");
      setSkipTransformation(transformation.skip_transformation || false);
    }
    
    loadSources();
  }, [transformation]);

  // Handle source change
  const handleSourceChange = (sourceId: string) => {
    setSourceId(sourceId);
    loadSourceFields(sourceId);
  };

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
      onSave(transformationData as Transformation);
    } catch (error) {
      console.error("Error saving transformation:", error);
    }
  };

  // Handle generating preview with consolidated loading state
  const handleGeneratePreview = async (validateFn: () => boolean) => {
    setIsLoading(true);
    await generatePreview(sourceId, fields, derivedColumns, skipTransformation, validateFn);
    setIsLoading(false);
  };

  return {
    isLoading: isLoading || isLoadingPreview,
    activeTab,
    selectedFunction,
    name,
    sourceId,
    fields,
    derivedColumns,
    skipTransformation,
    previewData,
    showPreview,
    sources,
    setActiveTab,
    setSelectedFunction,
    setName,
    setSourceId,
    setSkipTransformation,
    handleSourceChange,
    toggleFieldSelection,
    updateFieldAlias,
    addDerivedColumn,
    removeDerivedColumn,
    updateDerivedColumn,
    insertFunctionToExpression,
    generatePreview: handleGeneratePreview,
    handleSave
  };
};

export default useTransformationModal;
