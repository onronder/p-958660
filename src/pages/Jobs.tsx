
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Job } from "@/types/job";
import { fetchJobs } from "@/services/jobSchedulerService";
import InfoBanner from "@/components/InfoBanner";
import CreateJobDialog from "@/components/jobs/CreateJobDialog";
import JobsList from "@/components/jobs/JobsList";

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sources, setSources] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    loadJobs();
    loadSources();
  }, []);

  const loadJobs = async () => {
    setIsLoading(true);
    const jobsData = await fetchJobs();
    setJobs(jobsData);
    setIsLoading(false);
  };

  const loadSources = async () => {
    setSources([
      { id: "1", name: "Fashion Boutique" },
      { id: "2", name: "Tech Gadgets" },
      { id: "3", name: "Home Decor" },
    ]);
  };

  const handleJobCreated = (newJob: Job) => {
    setJobs([newJob, ...jobs]);
  };

  return (
    <div className="space-y-8">
      <InfoBanner 
        message={
          <span>
            <span className="font-bold">⚡ The Jobs</span> page allows you to schedule and manage automated data extraction and transformation tasks, ensuring your data is always up-to-date.
          </span>
        } 
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Jobs</h1>
        <CreateJobDialog 
          sources={sources}
          onJobCreated={handleJobCreated}
        />
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Scheduled Jobs</h3>
        <JobsList 
          jobs={jobs}
          isLoading={isLoading}
          onJobsUpdated={loadJobs}
          openCreateDialog={() => setIsDialogOpen(true)}
        />
      </Card>
    </div>
  );
};

export default Jobs;
