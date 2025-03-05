
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Play, Pause, Clock, Calendar, Trash } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Job, JobFrequency, JobStatus } from "@/types/job";
import { 
  createJob, 
  fetchJobs, 
  toggleJobStatus, 
  deleteJob, 
  triggerJobExecution, 
  calculateNextRun 
} from "@/services/jobSchedulerService";
import InfoBanner from "@/components/InfoBanner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createNotification } from "@/services/notificationService";

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // New job form state
  const [jobName, setJobName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobFrequency, setJobFrequency] = useState<JobFrequency>("Daily");
  const [jobSchedule, setJobSchedule] = useState("06:00");
  const [jobSource, setJobSource] = useState("");
  const [sources, setSources] = useState<{id: string, name: string}[]>([]);
  
  const navigate = useNavigate();

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
    // Mock data for now - this would fetch from your API
    setSources([
      { id: "1", name: "Fashion Boutique" },
      { id: "2", name: "Tech Gadgets" },
      { id: "3", name: "Home Decor" },
    ]);
  };

  const handleCreateJob = async () => {
    if (!jobName || !jobSource || !jobFrequency || !jobSchedule) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingJob(true);

    try {
      const sourceName = sources.find(s => s.id === jobSource)?.name || "";
      const nextRun = calculateNextRun(jobFrequency, jobSchedule);
      
      const newJob = await createJob({
        name: jobName,
        description: jobDescription,
        source_id: jobSource,
        source_name: sourceName,
        frequency: jobFrequency,
        schedule: jobSchedule,
        next_run: nextRun,
        status: "Active"
      });

      if (newJob) {
        setJobs([newJob, ...jobs]);
        setIsDialogOpen(false);
        resetForm();
        
        await createNotification(
          "Job Created",
          `Your job "${jobName}" has been scheduled.`,
          "success",
          "job",
          { showToast: true }
        );
      }
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingJob(false);
    }
  };

  const handleToggleJobStatus = async (job: Job) => {
    const updatedJob = await toggleJobStatus(job.id, job.status);
    if (updatedJob) {
      setJobs(jobs.map(j => j.id === job.id ? updatedJob : j));
      
      await createNotification(
        `Job ${updatedJob.status === "Active" ? "Activated" : "Paused"}`,
        `Job "${job.name}" has been ${updatedJob.status === "Active" ? "activated" : "paused"}.`,
        "info",
        "job",
        { showToast: true }
      );
    }
  };

  const handleRunNow = async (job: Job) => {
    toast({
      title: "Job Started",
      description: `Running job "${job.name}" now...`,
    });
    
    const success = await triggerJobExecution(job.id);
    
    if (success) {
      loadJobs(); // Refresh jobs list to get updated last_run and next_run
      
      await createNotification(
        "Job Executed",
        `Job "${job.name}" was manually executed.`,
        "info",
        "job",
        { showToast: false }
      );
    }
  };

  const handleDeleteJob = async (jobId: string, jobName: string) => {
    if (await deleteJob(jobId)) {
      setJobs(jobs.filter(j => j.id !== jobId));
      
      await createNotification(
        "Job Deleted",
        `Job "${jobName}" has been deleted.`,
        "info",
        "job",
        { showToast: true }
      );
    }
  };

  const resetForm = () => {
    setJobName("");
    setJobDescription("");
    setJobFrequency("Daily");
    setJobSchedule("06:00");
    setJobSource("");
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
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
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  placeholder="Daily Order Sync"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Sync orders daily"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="source" className="text-right">
                  Source
                </Label>
                <Select value={jobSource} onValueChange={setJobSource}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="frequency" className="text-right">
                  Frequency
                </Label>
                <Select value={jobFrequency} onValueChange={(value) => setJobFrequency(value as JobFrequency)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Once">Once</SelectItem>
                    <SelectItem value="Hourly">Hourly</SelectItem>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {jobFrequency === "Daily" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">
                    Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={jobSchedule}
                    onChange={(e) => setJobSchedule(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              )}
              
              {jobFrequency === "Weekly" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="day" className="text-right">
                      Day
                    </Label>
                    <Select 
                      value={jobSchedule.split(' ')[0] || "Monday"} 
                      onValueChange={(day) => setJobSchedule(`${day} ${jobSchedule.split(' ')[1] || "08:00"}`)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monday">Monday</SelectItem>
                        <SelectItem value="Tuesday">Tuesday</SelectItem>
                        <SelectItem value="Wednesday">Wednesday</SelectItem>
                        <SelectItem value="Thursday">Thursday</SelectItem>
                        <SelectItem value="Friday">Friday</SelectItem>
                        <SelectItem value="Saturday">Saturday</SelectItem>
                        <SelectItem value="Sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="weeklyTime" className="text-right">
                      Time
                    </Label>
                    <Input
                      id="weeklyTime"
                      type="time"
                      value={jobSchedule.split(' ')[1] || "08:00"}
                      onChange={(e) => setJobSchedule(`${jobSchedule.split(' ')[0] || "Monday"} ${e.target.value}`)}
                      className="col-span-3"
                    />
                  </div>
                </div>
              )}
              
              {jobFrequency === "Monthly" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="day" className="text-right">
                      Day of Month
                    </Label>
                    <Select 
                      value={jobSchedule.split(' ')[0] || "1"} 
                      onValueChange={(day) => setJobSchedule(`${day} ${jobSchedule.split(' ')[1] || "08:00"}`)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="monthlyTime" className="text-right">
                      Time
                    </Label>
                    <Input
                      id="monthlyTime"
                      type="time"
                      value={jobSchedule.split(' ')[1] || "08:00"}
                      onChange={(e) => setJobSchedule(`${jobSchedule.split(' ')[0] || "1"} ${e.target.value}`)}
                      className="col-span-3"
                    />
                  </div>
                </div>
              )}
              
              {jobFrequency === "Once" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={jobSchedule.split('T')[0] || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setJobSchedule(`${e.target.value}T${jobSchedule.split('T')[1] || "08:00"}`)}
                      className="col-span-3"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="onceTime" className="text-right">
                      Time
                    </Label>
                    <Input
                      id="onceTime"
                      type="time"
                      value={jobSchedule.split('T')[1] || "08:00"}
                      onChange={(e) => setJobSchedule(`${jobSchedule.split('T')[0] || new Date().toISOString().split('T')[0]}T${e.target.value}`)}
                      className="col-span-3"
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleCreateJob} 
                disabled={isCreatingJob}
              >
                {isCreatingJob ? "Creating..." : "Create Job"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Scheduled Jobs</h3>
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-muted-foreground">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-medium mb-2">No jobs scheduled</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Schedule automated jobs to extract and transform your data at regular intervals.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              Create Your First Job
            </Button>
          </div>
        ) : (
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
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        job.status === "Active" 
                          ? "bg-green-100 text-green-800" 
                          : job.status === "Completed"
                            ? "bg-blue-100 text-blue-800"
                            : job.status === "Failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {job.status}
                    </span>
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
        )}
      </Card>
    </div>
  );
};

export default Jobs;
