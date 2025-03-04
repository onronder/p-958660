
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { FunctionCategory, TransformationFunction } from "@/types/transformation";

interface DerivedColumn {
  name: string;
  expression: string;
}

interface TransformationStepProps {
  derivedColumns: DerivedColumn[];
  expressionError: string;
  selectedFunction: FunctionCategory;
  functionCategories: Record<FunctionCategory, TransformationFunction[]>;
  onSelectFunction: (category: FunctionCategory) => void;
  onUpdateDerivedColumn: (index: number, field: string, value: string) => void;
  onAddDerivedColumn: () => void;
  onRemoveDerivedColumn: (index: number) => void;
  onInsertFunction: (func: TransformationFunction, index: number) => void;
  onBack: () => void;
  onGeneratePreview: () => void;
}

const TransformationStep = ({
  derivedColumns,
  expressionError,
  selectedFunction,
  functionCategories,
  onSelectFunction,
  onUpdateDerivedColumn,
  onAddDerivedColumn,
  onRemoveDerivedColumn,
  onInsertFunction,
  onBack,
  onGeneratePreview,
}: TransformationStepProps) => {
  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-lg font-medium">Define Derived Columns</h3>
      <div className="space-y-4">
        {derivedColumns.map((column, index) => (
          <div key={index} className="border rounded-md p-4 space-y-3 relative">
            {index > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0"
                onClick={() => onRemoveDerivedColumn(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <div className="space-y-2">
              <Label htmlFor={`column-name-${index}`}>Column Name</Label>
              <Input
                id={`column-name-${index}`}
                value={column.name}
                onChange={(e) => onUpdateDerivedColumn(index, "name", e.target.value)}
                placeholder="e.g., tax_adjusted_price"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`column-expression-${index}`}>Expression</Label>
              <div className="grid grid-cols-1 gap-2">
                <Input
                  id={`column-expression-${index}`}
                  value={column.expression}
                  onChange={(e) => onUpdateDerivedColumn(index, "expression", e.target.value)}
                  placeholder="e.g., total_price * 1.2"
                />
                <div className="space-y-2">
                  <Label>Insert Function</Label>
                  <div className="space-y-2">
                    <Select 
                      value={selectedFunction} 
                      onValueChange={(value) => onSelectFunction(value as FunctionCategory)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select function type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(functionCategories).map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {functionCategories[selectedFunction].map((func) => (
                        <Button
                          key={func.name}
                          variant="outline"
                          size="sm"
                          onClick={() => onInsertFunction(func, index)}
                          title={func.description}
                        >
                          {func.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                {expressionError && (
                  <p className="text-sm text-red-500">{expressionError}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={onAddDerivedColumn}
          className="w-full"
        >
          + Add Another Derived Column
        </Button>
      </div>
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back: Field Selection
        </Button>
        <Button onClick={onGeneratePreview}>
          Generate Preview
        </Button>
      </div>
    </div>
  );
};

export default TransformationStep;
