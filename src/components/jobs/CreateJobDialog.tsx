
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
import NoSourcesWarning from "./NoSourcesWarning";
import JobForm from "./JobForm";

interface CreateJobDialogProps {
  sources: { id: string; name: string }[];
  onJobCreated: (newJob: any) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CreateJobDialog = ({ sources, onJobCreated, isOpen, onOpenChange }: CreateJobDialogProps) => {
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

  // Reset form and close dialog when job is created
  const handleJobCreated = (newJob: any) => {
    onJobCreated(newJob);
    handleDialogOpenChange(false);
  };

  // Check if sources exist before opening dialog
  const handleDialogOpen = () => {
    if (sources.length === 0) {
      toast({
        title: "No Data Sources",
        description: "You need to connect a data source before creating a job.",
        variant: "destructive",
      });
      navigate("/sources");
      return;
    }
    handleDialogOpenChange(true);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2" onClick={handleDialogOpen}>
          <Plus className="h-4 w-4" />
          Create New Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Set up an automated job to extract and transform your data on a schedule.
          </DialogDescription>
        </DialogHeader>
        
        {sources.length === 0 ? (
          <NoSourcesWarning />
        ) : (
          <JobForm 
            sources={sources} 
            onJobCreated={handleJobCreated} 
            onCancel={() => handleDialogOpenChange(false)} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobDialog;
