
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useCreateDataset } from "@/hooks/useCreateDataset";

const DatasetConfiguration = () => {
  const navigate = useNavigate();
  const { 
    name, 
    setName, 
    createDataset, 
    isSubmitting,
    sourceId,
    previewData
  } = useCreateDataset(() => {
    navigate("/my-datasets");
  });
  
  // Check if source is selected and preview data exists, otherwise redirect
  useEffect(() => {
    if (!sourceId) {
      console.log("No source selected, redirecting to source selection page");
      navigate("/create-dataset/source");
      return;
    }
    
    if (!previewData || previewData.length === 0) {
      console.log("No preview data available, redirecting to preview page");
      navigate("/create-dataset/preview");
    }
  }, [sourceId, previewData, navigate]);
  
  const handleBack = () => {
    navigate("/create-dataset/preview");
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      return;
    }
    
    await createDataset();
  };
  
  // If there's no source selected or preview data, show a minimal UI while redirecting
  if (!sourceId || !previewData || previewData.length === 0) {
    return (
      <div className="p-8 text-center">
        <p>Missing required data. Redirecting...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Configure Dataset</h2>
        <p className="text-muted-foreground mt-1">
          Provide a name and configure settings for your dataset.
        </p>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Dataset Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a descriptive name for your dataset"
              required
            />
            <p className="text-sm text-muted-foreground">
              Choose a name that describes what data this dataset contains.
            </p>
          </div>
          
          {/* Additional configuration options can be added here */}
          
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              onClick={handleBack}
              variant="outline"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={!name || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Dataset"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default DatasetConfiguration;
