
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyDatasetsStateProps {
  onCreateDataset: () => void;
}

const EmptyDatasetsState: React.FC<EmptyDatasetsStateProps> = ({ onCreateDataset }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg bg-muted/20">
      <div className="flex flex-col items-center text-center space-y-2 max-w-md">
        <div className="rounded-full bg-primary/10 p-3">
          <div className="rounded-full bg-primary/20 p-2">
            <Plus className="h-6 w-6 text-primary" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mt-3">No datasets yet</h3>
        <p className="text-muted-foreground mb-3">
          Create your first dataset to extract data from your connected sources. You can create datasets using predefined templates, dependent queries, or custom queries.
        </p>
        
        <Button onClick={onCreateDataset}>
          <Plus className="h-4 w-4 mr-2" />
          Create Dataset
        </Button>
      </div>
    </div>
  );
};

export default EmptyDatasetsState;
