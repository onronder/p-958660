
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfigurationStepProps {
  name: string;
  onNameChange: (name: string) => void;
}

const ConfigurationStep: React.FC<ConfigurationStepProps> = ({
  name,
  onNameChange
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
        
        {/* Additional configuration options could be added here in the future */}
        {/* For example: schedule, export options, etc. */}
      </div>
    </div>
  );
};

export default ConfigurationStep;
