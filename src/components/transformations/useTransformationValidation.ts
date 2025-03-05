
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { TransformationField, DerivedColumn } from "@/types/transformation";

export const useTransformationValidation = () => {
  const { toast } = useToast();
  const [expressionError, setExpressionError] = useState("");

  const validateExpressions = (
    skipTransformation: boolean, 
    fields: TransformationField[], 
    derivedColumns: DerivedColumn[]
  ): boolean => {
    if (skipTransformation) return true;
    
    const hasSelectedFields = fields.some(field => field.selected);
    if (!hasSelectedFields) {
      toast({
        title: "Validation Error",
        description: "Please select at least one field.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!skipTransformation && derivedColumns.length > 0) {
      const hasEmptyDerivedColumn = derivedColumns.some(
        col => !col.name.trim() || !col.expression.trim()
      );
      
      if (hasEmptyDerivedColumn) {
        setExpressionError("Derived column name and expression are required.");
        return false;
      }
    }
    
    return true;
  };

  return {
    expressionError,
    setExpressionError,
    validateExpressions
  };
};

export default useTransformationValidation;
