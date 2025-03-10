
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, FileText, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Job } from "@/types/job";
import { fetchJobs, fetchDeletedJobs, restoreJob, permanentlyDeleteJob } from "@/services/jobs/jobCrudService";
import InfoBanner from "@/components/InfoBanner";
import CreateJobDialog from "@/components/jobs/CreateJobDialog";
import JobsList from "@/components/jobs/JobsList";
import DeletedJobsTable from "@/components/jobs/DeletedJobsTable";
import LoadingState from "@/components/jobs/LoadingState";
import { useSources } from "@/hooks/useSources";

const Jobs = () => {
  const navigate = useNavigate();
  const { sources, isLoading: sourcesLoading } = useSources();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [deletedJobs, setDeletedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletedLoading, setIsDeletedLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sourcesExist, setSourcesExist] = useState(false);

  useEffect(() => {
    loadJobs();
    loadDeletedJobs();
  }, []);
  
  useEffect(() => {
    setSourcesExist(sources.length > 0);
  }, [sources]);

  const loadJobs = async () => {
    setIsLoading(true);
    const jobsData = await fetchJobs();
    setJobs(jobsData);
    setIsLoading(false);
  };
  
  const loadDeletedJobs = async () => {
    setIsDeletedLoading(true);
    const deletedJobsData = await fetchDeletedJobs();
    setDeletedJobs(deletedJobsData);
    setIsDeletedLoading(false);
  };

  const handleJobCreated = (newJob: Job) => {
    setJobs([newJob, ...jobs]);
  };

  const handleCreateButtonClick = () => {
    if (!sourcesExist) {
      toast({
        title: "No Data Sources",
        description: "You need to connect a data source before creating a job.",
        variant: "destructive",
      });
      navigate("/sources");
      return;
    }
    
    setIsDialogOpen(true);
  };
  
  const handleRestoreJob = async (jobId: string) => {
    const restoredJob = await restoreJob(jobId);
    if (restoredJob) {
      await loadJobs();
      await loadDeletedJobs();
      toast({
        title: "Job Restored",
        description: `The job "${restoredJob.name}" has been restored successfully.`,
      });
    }
  };
  
  const handlePermanentDelete = async (jobId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this job? This action cannot be undone.")) {
      const success = await permanentlyDeleteJob(jobId);
      if (success) {
        await loadDeletedJobs();
        toast({
          title: "Job Permanently Deleted",
          description: "The job has been permanently deleted from the system.",
        });
      }
    }
  };

  const sourcesForDialog = sources.map(source => ({
    id: source.id,
    name: source.name
  }));

  return (
    <div className="space-y-8">
      <InfoBanner 
        messageId="jobs-info"
        message={
          <span>
            <span className="font-bold">⚡ The Jobs</span> page allows you to schedule and manage automated data extraction and transformation tasks, ensuring your data is always up-to-date.
          </span>
        } 
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Jobs</h1>
        {sourcesExist ? (
          <CreateJobDialog 
            sources={sourcesForDialog}
            onJobCreated={handleJobCreated}
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        ) : (
          <Button asChild>
            <Link to="/sources" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Connect a Data Source
            </Link>
          </Button>
        )}
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Scheduled Jobs</h3>
        <JobsList 
          jobs={jobs}
          isLoading={isLoading || sourcesLoading}
          onJobsUpdated={loadJobs}
          openCreateDialog={handleCreateButtonClick}
          sourcesExist={sourcesExist}
        />
      </Card>
      
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-semibold">Deleted Jobs</h3>
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        
        <p className="text-muted-foreground mb-6">
          Deleted jobs remain inactive for 30 days after which they are permanently deleted.
        </p>
        
        {isDeletedLoading ? (
          <LoadingState />
        ) : (
          <DeletedJobsTable 
            deletedJobs={deletedJobs}
            onRestoreJob={handleRestoreJob}
            onPermanentDelete={handlePermanentDelete}
          />
        )}
      </Card>
    </div>
  );
};

export default Jobs;
