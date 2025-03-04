
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SourceTypeCard, { SourceType, SourceTypeOption } from "./SourceTypeCard";

interface SourceSelectionStepProps {
  sourceOptions: SourceTypeOption[];
  onSourceSelect: (sourceType: SourceType) => void;
  onBack: () => void;
}

const SourceSelectionStep: React.FC<SourceSelectionStepProps> = ({
  sourceOptions,
  onSourceSelect,
  onBack
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Add New Source</h1>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sources
        </Button>
      </div>
      
      <p className="text-muted-foreground">
        Select the type of data source you want to connect to FlowTechs.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sourceOptions.map((source) => (
          <SourceTypeCard 
            key={source.id}
            source={source}
            onSelect={onSourceSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default SourceSelectionStep;
