
import { useState, useEffect } from "react";
import { Transformation } from "@/types/transformation";
import { useTransformationSources } from "@/hooks/transformations/useTransformationSources";
import { useTransformationFields } from "@/hooks/transformations/useTransformationFields";
import { useTransformationDerivedColumns } from "@/hooks/transformations/useTransformationDerivedColumns";

interface UseTransformationBasicStateProps {
  transformation: Transformation | undefined;
}

export const useTransformationBasicState = ({ transformation }: UseTransformationBasicStateProps) => {
  const [activeTab, setActiveTab] = useState("fields");
  const [name, setName] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [skipTransformation, setSkipTransformation] = useState(false);
  
  // Import the functionality from our hooks
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

  return {
    activeTab,
    selectedFunction,
    name,
    sourceId,
    fields,
    derivedColumns,
    skipTransformation,
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
    insertFunctionToExpression
  };
};
