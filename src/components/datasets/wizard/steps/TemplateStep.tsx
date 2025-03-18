
import React from "react";
import PredefinedDatasetStep from "@/components/datasets/wizard/PredefinedDatasetStep";
import DependentDatasetStep from "@/components/datasets/wizard/DependentDatasetStep";
import CustomDatasetStep from "@/components/datasets/wizard/CustomDatasetStep";

interface TemplateStepProps {
  datasetType: 'predefined' | 'dependent' | 'custom';
  selectedTemplate: string;
  selectedDependentTemplate: string;
  customQuery: string;
  selectedSourceId: string;
  onSelectTemplate: (template: string) => void;
  onSelectDependentTemplate: (template: string) => void;
  onCustomQueryChange: (query: string) => void;
}

const TemplateStep: React.FC<TemplateStepProps> = ({
  datasetType,
  selectedTemplate,
  selectedDependentTemplate,
  customQuery,
  selectedSourceId,
  onSelectTemplate,
  onSelectDependentTemplate,
  onCustomQueryChange
}) => {
  if (datasetType === 'predefined') {
    return (
      <PredefinedDatasetStep
        selectedTemplate={selectedTemplate}
        onSelectTemplate={onSelectTemplate}
      />
    );
  } else if (datasetType === 'dependent') {
    return (
      <DependentDatasetStep
        selectedTemplate={selectedDependentTemplate}
        onSelectTemplate={onSelectDependentTemplate}
      />
    );
  } else {
    return (
      <CustomDatasetStep
        sourceId={selectedSourceId}
        query={customQuery}
        onQueryChange={onCustomQueryChange}
      />
    );
  }
};

export default TemplateStep;
