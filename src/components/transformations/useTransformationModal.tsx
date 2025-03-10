
import { useTransformationBasicState } from "./hooks/useTransformationBasicState";
import { useTransformationSave } from "./hooks/useTransformationSave";
import { useTransformationPreviewState } from "./hooks/useTransformationPreview";
import { useFunctionInsertion } from "./hooks/useFunctionInsertion";
import { Transformation } from "@/types/transformation";

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
  // Basic state management
  const {
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
  } = useTransformationBasicState({ 
    transformation 
  });

  // Preview functionality
  const {
    isLoading: previewLoading,
    previewData,
    showPreview,
    generatePreview
  } = useTransformationPreviewState({
    sourceId,
    fields,
    derivedColumns,
    skipTransformation
  });

  // Save functionality
  const {
    isLoading: saveLoading,
    handleSave
  } = useTransformationSave({
    transformation,
    name,
    sourceId,
    skipTransformation,
    fields,
    derivedColumns,
    onSave,
    onClose
  });

  // Function insertion helper
  const { handleInsertFunction } = useFunctionInsertion();

  // Combined loading state
  const isLoading = previewLoading || saveLoading;

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
    insertFunctionToExpression: insertFunctionToExpression,
    generatePreview,
    handleSave,
    handleInsertFunction: (func: any, index: number) => 
      handleInsertFunction(func, index, insertFunctionToExpression)
  };
};

export default useTransformationModal;
