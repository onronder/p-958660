
import React from "react";
import SourceSelectionStep from "@/components/sources/SourceSelectionStep";
import { Source } from "@/types/source";

interface SourceStepProps {
  sources: Source[];
  selectedSourceId: string;
  onSelectSource: (id: string, name: string) => void;
  onTestConnection: () => void;
  connectionTestResult?: { success: boolean; message: string } | null;
  isTestingConnection?: boolean;
}

const SourceStep: React.FC<SourceStepProps> = ({
  sources,
  selectedSourceId,
  onSelectSource,
  onTestConnection,
  connectionTestResult,
  isTestingConnection
}) => {
  return (
    <SourceSelectionStep
      sources={sources}
      selectedSourceId={selectedSourceId}
      onSelectSource={onSelectSource}
      onTestConnection={onTestConnection}
      connectionTestResult={connectionTestResult}
      isTestingConnection={isTestingConnection}
    />
  );
};

export default SourceStep;
