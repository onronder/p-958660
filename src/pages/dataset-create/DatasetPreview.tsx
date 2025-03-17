
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCreateDataset } from "@/hooks/useCreateDataset";
import { Loader2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";

const DatasetPreview = () => {
  const navigate = useNavigate();
  const { 
    previewData, 
    isLoading, 
    error, 
    generatePreview,
    sourceId,
    datasetType,
    templateName,
    customQuery 
  } = useCreateDataset(() => {});
  
  // Check if source is selected, if not redirect to source selection
  useEffect(() => {
    if (!sourceId) {
      console.log("No source selected, redirecting to source selection page");
      navigate("/create-dataset/source");
      return;
    }
    
    // Check if we have the necessary data to generate a preview
    if (
      (datasetType === "predefined" || datasetType === "dependent") && !templateName ||
      (datasetType === "custom" && !customQuery)
    ) {
      console.log("Missing template or query, redirecting to details page");
      navigate("/create-dataset/details");
      return;
    }
    
    // Generate preview if not already generated
    if (sourceId && (previewData.length === 0 && !isLoading && !error)) {
      generatePreview();
    }
  }, [sourceId, datasetType, templateName, customQuery, previewData, isLoading, error, navigate, generatePreview]);
  
  const handleBack = () => {
    navigate("/create-dataset/details");
  };
  
  const handleNext = () => {
    navigate("/create-dataset/configure");
  };
  
  // If there's no source selected, show a minimal UI while redirecting
  if (!sourceId) {
    return (
      <div className="p-8 text-center">
        <p>No data source selected. Redirecting to source selection...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Preview Dataset</h2>
        <p className="text-muted-foreground mt-1">
          Review a sample of your dataset before finalizing.
        </p>
      </div>
      
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Data Preview</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={generatePreview}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Preview
          </Button>
        </div>
        
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading preview data...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
            <p className="font-medium">Error loading preview:</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : previewData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No preview data available. Try refreshing or adjusting your query.
          </div>
        ) : (
          <div className="overflow-auto max-h-96">
            <pre className="text-xs p-4 bg-muted rounded-md">
              {JSON.stringify(previewData, null, 2)}
            </pre>
          </div>
        )}
      </Card>
      
      <div className="flex justify-between pt-4">
        <Button
          onClick={handleBack}
          variant="outline"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={isLoading || !!error || previewData.length === 0}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default DatasetPreview;
