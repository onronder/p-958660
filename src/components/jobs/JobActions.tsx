
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Trash } from "lucide-react";
import { Job } from "@/types/job";

interface JobActionsProps {
  job: Job;
  onToggleStatus: (job: Job) => Promise<void>;
  onRunNow: (job: Job) => Promise<void>;
  onDelete: (jobId: string, jobName: string) => Promise<void>;
}

const JobActions = ({ job, onToggleStatus, onRunNow, onDelete }: JobActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      {job.status !== "Completed" && (
        <>
          {job.status === "Active" ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2"
              onClick={() => onToggleStatus(job)}
            >
              <Pause className="h-4 w-4" />
              <span className="ml-1">Pause</span>
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2"
              onClick={() => onToggleStatus(job)}
            >
              <Play className="h-4 w-4" />
              <span className="ml-1">Resume</span>
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            onClick={() => onRunNow(job)}
          >
            <Play className="h-4 w-4" />
            <span className="ml-1">Run Now</span>
          </Button>
        </>
      )}
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
        onClick={() => onDelete(job.id, job.name)}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default JobActions;
