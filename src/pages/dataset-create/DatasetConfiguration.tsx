
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDataset } from "@/hooks/useCreateDataset";
import { toast } from "@/hooks/use-toast";
import { SaveAll, ArrowLeft, Tags, Calendar, Bell } from "lucide-react";

const DatasetConfiguration = () => {
  const navigate = useNavigate();
  const { name, setName, createDataset, isSubmitting } = useCreateDataset(() => {
    navigate("/my-datasets");
  });
  const [submitted, setSubmitted] = useState(false);
  
  const handleBack = () => {
    navigate("/create-dataset/preview");
  };
  
  const handleCreate = async () => {
    setSubmitted(true);
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please provide a name for your dataset",
        variant: "destructive"
      });
      return;
    }
    
    await createDataset();
    // Navigation is handled in the callback to useCreateDataset
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Dataset Configuration</h2>
        <p className="text-muted-foreground mt-1">
          Configure the final details for your dataset.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="dataset-name" className="text-base font-medium">Dataset Name</Label>
            <div className="relative">
              <Input
                id="dataset-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a descriptive name for this dataset"
                className={submitted && !name.trim() ? "border-red-500" : ""}
              />
              {submitted && !name.trim() && (
                <p className="text-xs text-red-500 mt-1">
                  A name is required
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              A clear name helps you identify this dataset later.
            </p>
          </div>
          
          {/* Additional settings could be added here */}
        </div>
        
        <div className="space-y-4 border-l pl-8">
          <h3 className="font-medium">Additional Options</h3>
          
          <div className="space-y-4">
            <div className="flex items-start border rounded-md p-4 bg-muted/20">
              <div className="p-2 rounded-full bg-amber-100 text-amber-600 mr-3">
                <Tags className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">Tags</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Organize your datasets with tags (Coming soon)
                </p>
              </div>
            </div>
            
            <div className="flex items-start border rounded-md p-4 bg-muted/20">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">Schedule</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Set up automatic refresh schedules (Coming soon)
                </p>
              </div>
            </div>
            
            <div className="flex items-start border rounded-md p-4 bg-muted/20">
              <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">Notifications</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Get notified when dataset updates (Coming soon)
                </p>
              </div>
            </div>
          </div>
        </div>
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
          onClick={handleCreate}
          disabled={isSubmitting}
          className="flex items-center"
        >
          {isSubmitting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin">●</span>
              Creating...
            </>
          ) : (
            <>
              <SaveAll className="mr-2 h-4 w-4" />
              Create Dataset
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DatasetConfiguration;
