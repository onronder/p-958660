
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Transformation, TransformationField, DerivedColumn } from "@/types/transformation";

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
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [name, setName] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [fields, setFields] = useState<any[]>([]);
  const [derivedColumns, setDerivedColumns] = useState<DerivedColumn[]>([]);
  const [skipTransformation, setSkipTransformation] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [sources, setSources] = useState([]);

  // Initialize form with transformation data if editing
  useEffect(() => {
    if (transformation) {
      setName(transformation.name || "");
      setSourceId(transformation.source_id || "");
      setSkipTransformation(transformation.skip_transformation || false);
      
      // Handle fields and derived columns if they exist in the transformation
      if (transformation.fields) {
        setFields(transformation.fields || []);
      }
      
      if (transformation.derived_columns) {
        setDerivedColumns(transformation.derived_columns || []);
      }
    }
    
    loadSources();
  }, [transformation]);

  // Load available data sources
  const loadSources = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-sources", {
        method: "GET"
      });
      
      if (error) throw error;
      setSources(data?.sources || []);
      
      // If this is a new transformation, set the first source as default
      if (!transformation && data?.sources?.length > 0) {
        setSourceId(data.sources[0].id);
        loadSourceFields(data.sources[0].id);
      } else if (transformation?.source_id) {
        loadSourceFields(transformation.source_id);
      }
    } catch (error) {
      console.error("Error loading sources:", error);
      toast({
        title: "Error",
        description: "Failed to load data sources.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load fields from a selected source
  const loadSourceFields = async (id: string) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-source-fields", {
        body: { source_id: id }
      });
      
      if (error) throw error;
      
      const fieldsWithSelection = data.fields.map(field => ({
        name: field.name,
        type: field.type,
        selected: transformation && transformation.fields
          ? transformation.fields.some(f => f.name === field.name)
          : true,
        alias: transformation?.fields?.find(f => f.name === field.name)?.alias || field.name
      }));
      
      setFields(fieldsWithSelection);
    } catch (error) {
      console.error("Error loading source fields:", error);
      toast({
        title: "Error",
        description: "Failed to load source fields.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle source change
  const handleSourceChange = (sourceId: string) => {
    setSourceId(sourceId);
    loadSourceFields(sourceId);
    
    // Reset derived columns when source changes
    if (!transformation) {
      setDerivedColumns([]);
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

  // Add new derived column
  const addDerivedColumn = () => {
    const newColumn = {
      name: `derived_column_${derivedColumns.length + 1}`,
      expression: "",
      description: ""
    };
    
    setDerivedColumns([...derivedColumns, newColumn]);
  };

  // Remove derived column
  const removeDerivedColumn = (index: number) => {
    setDerivedColumns(
      derivedColumns.filter((_, i) => i !== index)
    );
  };

  // Update derived column
  const updateDerivedColumn = (index: number, field: string, value: string) => {
    setDerivedColumns(
      derivedColumns.map((col, i) => 
        i === index ? { ...col, [field]: value } : col
      )
    );
  };

  // Insert function into expression
  const insertFunctionToExpression = (index: number, functionText: string) => {
    const currentExpression = derivedColumns[index]?.expression || "";
    const newExpression = currentExpression + functionText;
    
    updateDerivedColumn(index, "expression", newExpression);
  };

  // Generate preview data
  const generatePreview = async (validateFn: () => boolean) => {
    if (!validateFn()) return;
    
    setIsLoading(true);
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
    } catch (error) {
      console.error("Error generating preview:", error);
      toast({
        title: "Preview Error",
        description: error instanceof Error ? error.message : "Failed to generate preview.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
      // Cast these fields to any to avoid TypeScript errors until DB schema is updated
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

  return {
    isLoading,
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
    generatePreview,
    handleSave
  };
};

export default useTransformationModal;
