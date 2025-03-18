
import React from "react";
import ConfigurationStepBase from "@/components/datasets/wizard/ConfigurationStep";
import { Source } from "@/types/source";

interface ConfigurationStepProps {
  name: string;
  onNameChange: (name: string) => void;
  sourceId: string;
  onSourceChange: (sourceId: string) => void;
  sources: Source[];
  datasetType: 'predefined' | 'dependent' | 'custom';
  templateName?: string;
}

const ConfigurationStep: React.FC<ConfigurationStepProps> = ({
  name,
  onNameChange,
  sourceId,
  onSourceChange,
  sources,
  datasetType,
  templateName
}) => {
  return (
    <ConfigurationStepBase
      name={name}
      onNameChange={onNameChange}
      sourceId={sourceId}
      onSourceChange={onSourceChange}
      sources={sources}
      isLoading={false}
      datasetType={datasetType}
      templateName={templateName}
    />
  );
};

export default ConfigurationStep;
