
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CreateDatasetDialogProps {
  sources: { id: string; name: string }[];
  onDatasetCreated: (newDataset: any) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CreateDatasetDialog = ({ sources, onDatasetCreated, isOpen, onOpenChange }: CreateDatasetDialogProps) => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Handle external open state changes
  useEffect(() => {
    if (isOpen !== undefined) {
      setIsDialogOpen(isOpen);
    }
  }, [isOpen]);

  // Handle dialog state changes
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  // Check if sources exist before opening dialog
  const handleDialogOpen = () => {
    if (sources.length === 0) {
      toast({
        title: "No Data Sources",
        description: "You need to connect a data source before creating a dataset.",
        variant: "destructive",
      });
      navigate("/sources");
      return;
    }
    handleDialogOpenChange(true);
  };

  const handleCreateDataset = () => {
    // For now, we'll just navigate to a future dataset creation page
    // In the future, this will be replaced with a proper form/wizard
    handleDialogOpenChange(false);
    navigate("/create-dataset");
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2" onClick={handleDialogOpen}>
          <Plus className="h-4 w-4" />
          Create New Dataset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Dataset</DialogTitle>
          <DialogDescription>
            Create a dataset to extract and process data from your connected sources.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <p>Start creating a new dataset to extract data from your connected sources.</p>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => handleDialogOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDataset}>
              Start Dataset Creation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDatasetDialog;
