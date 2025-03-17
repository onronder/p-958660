
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

interface DatasetsHeaderProps {
  onCreateDataset: () => void;
  onRefresh: () => void;
}

const DatasetsHeader: React.FC<DatasetsHeaderProps> = ({ 
  onCreateDataset, 
  onRefresh 
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Datasets</h1>
        <p className="text-muted-foreground mt-1">
          Create and manage data extractions from your connected sources
        </p>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 sm:flex-none"
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        
        <Button 
          variant="default" 
          size="sm"
          className="flex-1 sm:flex-none"
          onClick={onCreateDataset}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Dataset
        </Button>
      </div>
    </div>
  );
};

export default DatasetsHeader;
