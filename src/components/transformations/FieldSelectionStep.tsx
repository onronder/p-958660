
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { TransformationField } from "@/types/transformation";

interface FieldSelectionStepProps {
  fields: TransformationField[];
  isLoading: boolean;
  onToggleField: (fieldId: string) => void;
  onUpdateAlias: (fieldId: string, alias: string) => void;
  onNext: () => void;
}

const FieldSelectionStep = ({
  fields,
  isLoading,
  onToggleField,
  onUpdateAlias,
  onNext,
}: FieldSelectionStepProps) => {
  const fieldsByCategory = fields.reduce<Record<string, TransformationField[]>>((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {});

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-lg font-medium">Select Fields</h3>
      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        Object.entries(fieldsByCategory).map(([category, categoryFields]) => (
          <div key={category} className="space-y-2">
            <h4 className="font-medium text-sm">{category}</h4>
            <div className="border rounded-md p-4 space-y-3">
              {categoryFields.map((field) => (
                <div key={field.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`field-${field.id}`}
                    checked={field.selected}
                    onCheckedChange={() => onToggleField(field.id)}
                  />
                  <label
                    htmlFor={`field-${field.id}`}
                    className="text-sm font-medium leading-none flex-1"
                  >
                    {field.name}
                  </label>
                  {field.selected && (
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`alias-${field.id}`} className="text-xs">Alias:</Label>
                      <Input
                        id={`alias-${field.id}`}
                        className="h-8 w-32 text-xs"
                        value={field.alias || ""}
                        onChange={(e) => onUpdateAlias(field.id, e.target.value)}
                        placeholder="Rename field"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
      <div className="flex justify-end">
        <Button onClick={onNext}>
          Next: Define Transformations
        </Button>
      </div>
    </div>
  );
};

export default FieldSelectionStep;
