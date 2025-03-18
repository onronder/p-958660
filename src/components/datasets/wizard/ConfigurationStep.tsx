
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Source } from "@/types/source";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ConfigurationStepProps {
  name: string;
  onNameChange: (name: string) => void;
  sourceId: string;
  onSourceChange: (sourceId: string) => void;
  sources: Source[];
  isLoading: boolean;
  datasetType?: "predefined" | "dependent" | "custom";
  templateName?: string;
}

const ConfigurationStep: React.FC<ConfigurationStepProps> = ({
  name,
  onNameChange,
  sourceId,
  onSourceChange,
  sources,
  isLoading,
  datasetType,
  templateName
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Dataset Configuration</h2>
      <p className="text-muted-foreground">
        Configure the final details for your dataset.
      </p>
      
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label htmlFor="dataset-name">Dataset Name</Label>
          <Input
            id="dataset-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter a descriptive name for this dataset"
          />
          <p className="text-xs text-muted-foreground">
            A clear name helps you identify this dataset later.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="source-select">Data Source</Label>
          <Select 
            value={sourceId} 
            onValueChange={onSourceChange}
            disabled={isLoading}
          >
            <SelectTrigger id="source-select">
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
          <p className="text-xs text-muted-foreground">
            Choose the source from which to extract data.
          </p>
        </div>
        
        {/* Additional configuration options could be added here in the future */}
        {/* For example: schedule, export options, etc. */}
      </div>
    </div>
  );
};

export default ConfigurationStep;
