
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Source } from "@/types/source";

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
  datasetType,
  templateName
}) => {
  // Generate a suggested name if template is selected
  React.useEffect(() => {
    if (templateName && !name) {
      // Only suggest a name if the user hasn't entered one yet
      let suggestedName = "";
      
      if (datasetType === "predefined") {
        suggestedName = `${templateName} Dataset`;
      } else if (datasetType === "dependent") {
        suggestedName = `${templateName} Related Data`;
      } else {
        suggestedName = "Custom Dataset";
      }
      
      onNameChange(suggestedName);
    }
  }, [templateName, datasetType, name, onNameChange]);

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
        
        <div className="p-4 bg-muted/50 rounded-lg border border-muted mt-4">
          <h3 className="text-sm font-medium mb-2">About Dataset Configuration</h3>
          {datasetType === "predefined" && (
            <p className="text-sm text-muted-foreground">
              You're creating a predefined dataset{templateName ? ` based on the "${templateName}" template` : ""}.
              This will extract standard data using pre-built queries.
            </p>
          )}
          
          {datasetType === "dependent" && (
            <p className="text-sm text-muted-foreground">
              You're creating a dependent dataset{templateName ? ` for "${templateName}"` : ""}.
              This will extract related data that requires multiple connected queries.
            </p>
          )}
          
          {datasetType === "custom" && (
            <p className="text-sm text-muted-foreground">
              You're creating a custom dataset with your own GraphQL query.
              This gives you complete control over what data is extracted.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigurationStep;
