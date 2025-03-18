
import React from "react";
import SourceSelectionStep from "@/components/sources/SourceSelectionStep";
import { Source } from "@/types/source";

interface SourceStepProps {
  sources: Source[];
  selectedSourceId: string;
  onSelectSource: (id: string, name: string) => void;
  onTestConnection: () => void;
}

const SourceStep: React.FC<SourceStepProps> = ({
  sources,
  selectedSourceId,
  onSelectSource,
  onTestConnection
}) => {
  return (
    <SourceSelectionStep
      sources={sources}
      selectedSourceId={selectedSourceId}
      onSelectSource={onSelectSource}
      onTestConnection={onTestConnection}
    />
  );
};

export default SourceStep;
