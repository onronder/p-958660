
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Job } from "@/types/job";
import { fetchJobs } from "@/services/jobs/jobCrudService";
import InfoBanner from "@/components/InfoBanner";
import CreateJobDialog from "@/components/jobs/CreateJobDialog";
import JobsList from "@/components/jobs/JobsList";
import { useSources } from "@/hooks/useSources";

const Jobs = () => {
  const navigate = useNavigate();
  const { sources, isLoading: sourcesLoading } = useSources();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sourcesExist, setSourcesExist] = useState(false);

  useEffect(() => {
    loadJobs();
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
    </div>
  );
};

export default Jobs;
