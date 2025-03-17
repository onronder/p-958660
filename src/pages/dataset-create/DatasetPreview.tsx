
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCreateDataset } from "@/hooks/useCreateDataset";
import { Loader2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

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
  
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Check if we have required data to generate a preview
  useEffect(() => {
    const checkRequiredData = () => {
      // First check if source ID exists
      const effectiveSourceId = sourceId || sessionStorage.getItem('dataset_sourceId_backup');
      if (!effectiveSourceId) {
        console.log("No source selected, redirecting to source selection page");
        toast.error("Please select a data source first");
        navigate("/create-dataset/source");
        return false;
      }
      
      // Then check dataset type
      const effectiveDatasetType = datasetType || sessionStorage.getItem('dataset_datasetType_backup');
      if (!effectiveDatasetType) {
        console.log("No dataset type selected, redirecting to type selection page");
        toast.error("Please select a dataset type");
        navigate("/create-dataset/type");
        return false;
      }
      
      // Check if we have the necessary data based on type
      if (effectiveDatasetType === 'predefined' || effectiveDatasetType === 'dependent') {
        const effectiveTemplateName = templateName || JSON.parse(sessionStorage.getItem('dataset_templateName_backup') || 'null');
        if (!effectiveTemplateName) {
          console.log("No template selected, redirecting to details page");
          toast.error("Please select a template");
          navigate("/create-dataset/details");
          return false;
        }
      } else if (effectiveDatasetType === 'custom') {
        const effectiveCustomQuery = customQuery || JSON.parse(sessionStorage.getItem('dataset_customQuery_backup') || 'null');
        if (!effectiveCustomQuery) {
          console.log("No custom query entered, redirecting to details page");
          toast.error("Please enter a custom query");
          navigate("/create-dataset/details");
          return false;
        }
      }
      
      return true;
    };
    
    // Log current state for debugging
    console.log("DatasetPreview mounted with state:", {
      sourceId,
      datasetType,
      templateName,
      customQuery,
      previewData: previewData?.length || 0,
      isLoading,
      error
    });
    
    // If valid data, generate preview on first load
    if (isInitialLoad && checkRequiredData()) {
      console.log("Valid data found, generating preview");
      generatePreview();
      setIsInitialLoad(false);
    }
  }, [sourceId, datasetType, templateName, customQuery, previewData, isLoading, navigate, generatePreview, isInitialLoad]);
  
  const handleBack = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate("/create-dataset/details");
      setIsNavigating(false);
    }, 100);
  };
  
  const handleNext = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate("/create-dataset/configure");
      setIsNavigating(false);
    }, 100);
  };
  
  const handleRefresh = () => {
    generatePreview();
  };
  
  // If page is in loading or navigating state, show appropriate UI
  if (isNavigating) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Navigating...</span>
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
            onClick={handleRefresh}
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
        ) : previewData?.length === 0 ? (
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
          disabled={isNavigating || isLoading}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={isLoading || !!error || previewData?.length === 0 || isNavigating}
        >
          {isLoading || isNavigating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isLoading ? "Loading..." : "Processing..."}
            </>
          ) : "Next Step"}
        </Button>
      </div>
    </div>
  );
};

export default DatasetPreview;
