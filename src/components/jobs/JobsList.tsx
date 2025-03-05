
import { useState } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Play, Pause, Trash, FileText } from "lucide-react";
import { Job } from "@/types/job";
import { triggerJobExecution, toggleJobStatus, deleteJob } from "@/services/jobSchedulerService";
import { toast } from "@/hooks/use-toast";
import JobStatusBadge from "./JobStatusBadge";
import { Link } from "react-router-dom";

interface JobsListProps {
  jobs: Job[];
  isLoading: boolean;
  onJobsUpdated: () => void;
  openCreateDialog: () => void;
  sourcesExist: boolean;
}

const JobsList = ({ jobs, isLoading, onJobsUpdated, openCreateDialog, sourcesExist }: JobsListProps) => {
  
  const handleToggleJobStatus = async (job: Job) => {
    const updatedJob = await toggleJobStatus(job.id, job.status);
    if (updatedJob) {
      onJobsUpdated();
    }
  };

  const handleRunNow = async (job: Job) => {
    toast({
      title: "Job Started",
      description: `Running job "${job.name}" now...`,
    });
    
    const success = await triggerJobExecution(job.id);
    
    if (success) {
      onJobsUpdated();
    }
  };

  const handleDeleteJob = async (jobId: string, jobName: string) => {
    if (await deleteJob(jobId)) {
      onJobsUpdated();
    }
  };

  const getScheduleDisplay = (job: Job) => {
    switch (job.frequency) {
      case "Once":
        return `Once on ${format(new Date(job.schedule), "PPP 'at' p")}`;
      case "Hourly":
        return "Every hour";
      case "Daily":
        return `Daily at ${job.schedule}`;
      case "Weekly":
        return `Weekly on ${job.schedule}`;
      case "Monthly":
        return `Monthly on day ${job.schedule.split(' ')[0]} at ${job.schedule.split(' ')[1]}`;
      default:
        return job.schedule;
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-muted-foreground">Loading jobs...</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    if (!sourcesExist) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Data Sources Available</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            You need to connect a data source before you can create automated jobs.
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
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Schedule</TableHead>
          <TableHead>Last Run</TableHead>
          <TableHead>Next Run</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id}>
            <TableCell className="font-medium">
              <div>
                <div>{job.name}</div>
                {job.description && (
                  <div className="text-xs text-muted-foreground mt-1">{job.description}</div>
                )}
              </div>
            </TableCell>
            <TableCell>{job.source_name}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{getScheduleDisplay(job)}</span>
              </div>
            </TableCell>
            <TableCell>
              {job.last_run ? format(new Date(job.last_run), "PPp") : "Never"}
            </TableCell>
            <TableCell>
              {job.next_run ? format(new Date(job.next_run), "PPp") : "Not scheduled"}
            </TableCell>
            <TableCell>
              <JobStatusBadge status={job.status} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {job.status !== "Completed" && (
                  <>
                    {job.status === "Active" ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={() => handleToggleJobStatus(job)}
                      >
                        <Pause className="h-4 w-4" />
                        <span className="ml-1">Pause</span>
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={() => handleToggleJobStatus(job)}
                      >
                        <Play className="h-4 w-4" />
                        <span className="ml-1">Resume</span>
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2"
                      onClick={() => handleRunNow(job)}
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
                  onClick={() => handleDeleteJob(job.id, job.name)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default JobsList;
