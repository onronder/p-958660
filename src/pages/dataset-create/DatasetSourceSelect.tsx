
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCreateDataset } from "@/hooks/useCreateDataset";
import SourceSelectionStep from "@/components/datasets/wizard/SourceSelectionStep";

const DatasetSourceSelect = () => {
  const navigate = useNavigate();
  const { 
    sources, 
    sourceId, 
    handleSourceSelect,
    testConnection,
    connectionTestResult
  } = useCreateDataset(() => {});
  
  const handleNext = () => {
    if (sourceId) {
      navigate("/create-dataset/type");
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Select Data Source</h2>
        <p className="text-muted-foreground mt-1">
          Choose a data source to create a dataset from.
        </p>
      </div>
      
      <SourceSelectionStep
        sources={sources}
        selectedSourceId={sourceId}
        onSelectSource={(id, name) => {
          handleSourceSelect(id, name);
        }}
        onTestConnection={testConnection}
      />
      
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleNext}
          disabled={!sourceId}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default DatasetSourceSelect;
