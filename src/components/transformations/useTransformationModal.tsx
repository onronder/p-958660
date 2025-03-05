
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSources } from "@/hooks/useSources";
import { 
  Transformation, 
  TransformationField, 
  FunctionCategory, 
  DerivedColumn 
} from "@/types/transformation";
import { mockFields } from "@/utils/transformationUtils";

export const useTransformationModal = (
  transformation?: Transformation,
  onSave: (transformation: Transformation) => void,
  onClose: () => void
) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { sources } = useSources();
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("fields");
  const [selectedFunction, setSelectedFunction] = useState<FunctionCategory>("Arithmetic");
  
  const [name, setName] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [fields, setFields] = useState<TransformationField[]>([]);
  const [derivedColumns, setDerivedColumns] = useState<DerivedColumn[]>([
    { name: "", expression: "" }
  ]);
  const [skipTransformation, setSkipTransformation] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (transformation) {
      setName(transformation.name);
      setSourceId(transformation.source_id);
      fetchFields(transformation.source_id);
      setSkipTransformation(transformation.skip_transformation || false);
      
      if (transformation.expression) {
        setDerivedColumns([{ name: "derived_column", expression: transformation.expression }]);
      }
    }
  }, [transformation]);

  const fetchFields = async (sourceId: string) => {
    if (!sourceId) return;
    
    try {
      setIsLoading(true);
      const fetchedFields = mockFields(sourceId);
      setFields(fetchedFields);
    } catch (error) {
      console.error("Error fetching fields:", error);
      toast({
        title: "Error",
        description: "Failed to load source fields. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSourceChange = (sourceId: string) => {
    setSourceId(sourceId);
    fetchFields(sourceId);
  };

  const toggleFieldSelection = (fieldId: string) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, selected: !field.selected } : field
    ));
  };

  const updateFieldAlias = (fieldId: string, alias: string) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, alias } : field
    ));
  };

  const addDerivedColumn = () => {
    setDerivedColumns([...derivedColumns, { name: "", expression: "" }]);
  };

  const removeDerivedColumn = (index: number) => {
    setDerivedColumns(derivedColumns.filter((_, i) => i !== index));
  };

  const updateDerivedColumn = (index: number, field: string, value: string) => {
    setDerivedColumns(derivedColumns.map((col, i) => 
      i === index ? { ...col, [field]: value } : col
    ));
  };

  const insertFunctionToExpression = (func: any, index: number) => {
    const currentExpression = derivedColumns[index].expression;
    const updatedExpression = currentExpression + func.name + "()";
    updateDerivedColumn(index, "expression", updatedExpression);
  };

  const generatePreview = async (validateExpressions: (skipTransformation: boolean, fields: TransformationField[], derivedColumns: DerivedColumn[]) => boolean) => {
    if (!validateExpressions(skipTransformation, fields, derivedColumns)) return;
    
    try {
      setIsLoading(true);
      
      const mockPreviewData = [
        { order_id: "1001", total_price: 99.99, derived_price: 119.99 },
        { order_id: "1002", total_price: 149.99, derived_price: 179.99 },
        { order_id: "1003", total_price: 199.99, derived_price: 239.99 },
      ];
      
      setPreviewData(mockPreviewData);
      setShowPreview(true);
      setActiveTab("preview");
    } catch (error) {
      console.error("Error generating preview:", error);
      toast({
        title: "Error",
        description: "Failed to generate preview. Please check your expressions.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (validateExpressions: (skipTransformation: boolean, fields: TransformationField[], derivedColumns: DerivedColumn[]) => boolean) => {
    if (!validateExpressions(skipTransformation, fields, derivedColumns)) return;
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save transformations.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const selectedSource = sources.find(s => s.id === sourceId);
      
      const newTransformation: Transformation = {
        id: transformation?.id || crypto.randomUUID(),
        name,
        source_id: sourceId,
        source_name: selectedSource?.name || "Unknown Source",
        status: "Active",
        last_modified: new Date().toISOString().split('T')[0],
        user_id: user.id,
        skip_transformation: skipTransformation,
        expression: skipTransformation ? undefined : derivedColumns.map(col => col.expression).join(';')
      };
      
      onSave(newTransformation);
      
      toast({
        title: "Success",
        description: `Transformation ${transformation ? "updated" : "created"} successfully.`,
      });
      
      onClose();
    } catch (error) {
      console.error("Error saving transformation:", error);
      toast({
        title: "Error",
        description: "Failed to save transformation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
