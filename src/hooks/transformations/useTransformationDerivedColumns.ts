
import { useState } from "react";
import { DerivedColumn } from "@/types/transformation";

export const useTransformationDerivedColumns = (initialDerivedColumns: DerivedColumn[] = []) => {
  const [derivedColumns, setDerivedColumns] = useState<DerivedColumn[]>(initialDerivedColumns);
  const [selectedFunction, setSelectedFunction] = useState(null);

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

  return {
    derivedColumns,
    setDerivedColumns,
    selectedFunction,
    setSelectedFunction,
    addDerivedColumn,
    removeDerivedColumn,
    updateDerivedColumn,
    insertFunctionToExpression
  };
};
