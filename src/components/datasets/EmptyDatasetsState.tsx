
import React from "react";
import { Button } from "@/components/ui/button";
import { Database, FileText } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyDatasetsStateProps {
  sourcesExist: boolean;
  openCreateDialog: () => void;
}

const EmptyDatasetsState = ({ sourcesExist, openCreateDialog }: EmptyDatasetsStateProps) => {
  if (!sourcesExist) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Database className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
        <h3 className="text-lg font-medium mb-2">Let's Connect Your First Data Source</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          You need to connect a data source before you can create datasets.
          This will allow you to extract and process your data efficiently.
        </p>
        <Button asChild>
          <Link to="/sources">
            Go to My Sources
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <FileText className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
      <h3 className="text-lg font-medium mb-2">No datasets available</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Create your first dataset to start extracting data from your connected sources.
      </p>
      <Button onClick={openCreateDialog}>
        Create Your First Dataset
      </Button>
    </div>
  );
};

export default EmptyDatasetsState;
