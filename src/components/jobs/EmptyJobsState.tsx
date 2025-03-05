
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Database } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyJobsStateProps {
  sourcesExist: boolean;
  openCreateDialog: () => void;
}

const EmptyJobsState = ({ sourcesExist, openCreateDialog }: EmptyJobsStateProps) => {
  if (!sourcesExist) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Database className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
        <h3 className="text-lg font-medium mb-2">Let's Connect Your First Data Source</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          You need to connect a data source before you can create automated jobs.
          This will allow you to extract and transform your data efficiently.
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
      <Calendar className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
      <h3 className="text-lg font-medium mb-2">No jobs scheduled</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Schedule automated jobs to extract and transform your data at regular intervals.
      </p>
      <Button onClick={openCreateDialog}>
        Create Your First Job
      </Button>
    </div>
  );
};

export default EmptyJobsState;
