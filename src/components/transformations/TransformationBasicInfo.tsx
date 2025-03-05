
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Source } from "@/types/source";

interface TransformationBasicInfoProps {
  name: string;
  sourceId: string;
  skipTransformation: boolean;
  isEditMode: boolean;
  sources: Source[];
  onNameChange: (name: string) => void;
  onSourceChange: (sourceId: string) => void;
  onSkipTransformationChange: (checked: boolean) => void;
  onActiveTabChange: (tab: string) => void;
}

const TransformationBasicInfo: React.FC<TransformationBasicInfoProps> = ({
  name,
  sourceId,
  skipTransformation,
  isEditMode,
  sources,
  onNameChange,
  onSourceChange,
  onSkipTransformationChange,
  onActiveTabChange,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Transformation Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter a name for this transformation"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="source">Data Source</Label>
        <Select 
          value={sourceId} 
          onValueChange={onSourceChange}
          disabled={isEditMode}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a data source" />
          </SelectTrigger>
          <SelectContent>
            {sources.map((source) => (
              <SelectItem key={source.id} value={source.id}>
                {source.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="skipTransformation"
          checked={skipTransformation}
          onCheckedChange={(checked) => {
            onSkipTransformationChange(checked as boolean);
            if (checked) {
              onActiveTabChange("review");
            }
          }}
        />
        <label
          htmlFor="skipTransformation"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Skip Transformation (Export Raw Data)
        </label>
      </div>
    </div>
  );
};

export default TransformationBasicInfo;
