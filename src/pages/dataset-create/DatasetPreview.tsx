
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCreateDataset } from "@/hooks/useCreateDataset";
import { Loader2, RefreshCw, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";

const DatasetPreview = () => {
  const navigate = useNavigate();
  const { previewData, isLoading, generatePreview } = useCreateDataset(() => {});
  
  useEffect(() => {
    generatePreview();
  }, []);
  
  const handleBack = () => {
    navigate("/create-dataset/details");
  };
  
  const handleNext = () => {
    navigate("/create-dataset/configure");
  };
  
  const renderCellValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">null</span>;
    }
    
    if (typeof value === "object") {
      return (
        <div className="max-w-xs truncate">
          {JSON.stringify(value)}
        </div>
      );
    }
    
    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }
    
    return String(value);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Data Preview</h2>
          <p className="text-muted-foreground mt-1">
            Review a sample of the data before finalizing
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={generatePreview}
          disabled={isLoading}
          className="flex items-center"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh Preview
        </Button>
      </div>
      
      <div className="border rounded-md overflow-hidden bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Generating data preview...</p>
            </div>
          </div>
        ) : previewData.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="p-4 bg-blue-50 border-b flex items-center">
              <CheckCircle2 className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-blue-700 font-medium">Preview data loaded successfully</span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  {Object.keys(previewData[0]).map(key => (
                    <th key={key} className="px-4 py-3 text-left font-medium">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((item, rowIndex) => (
                  <tr key={rowIndex} className="border-t border-b even:bg-muted/20">
                    {Object.values(item).map((value: any, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3">
                        {renderCellValue(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-60 flex-col">
            <p className="text-muted-foreground">No preview data available.</p>
            <Button 
              variant="outline" 
              onClick={generatePreview} 
              className="mt-4"
            >
              Try Refreshing
            </Button>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-700">
        <p>This is a preview of the first few records that will be included in your dataset.</p>
        {previewData.length > 0 && (
          <p className="mt-2">
            <span className="font-medium">Preview contains:</span> {previewData.length} records.
            The full extraction will likely contain more records.
          </p>
        )}
      </div>
      
      <div className="flex justify-between pt-4">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={isLoading || previewData.length === 0}
          className="flex items-center"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DatasetPreview;
