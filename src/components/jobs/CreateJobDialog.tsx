
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, AlertCircle } from "lucide-react";
import { JobFrequency } from "@/types/job";
import { toast } from "@/hooks/use-toast";
import { createJob, calculateNextRun } from "@/services/jobSchedulerService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface CreateJobDialogProps {
  sources: { id: string; name: string }[];
  onJobCreated: (newJob: any) => void;
}

const CreateJobDialog = ({ sources, onJobCreated }: CreateJobDialogProps) => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [jobName, setJobName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobFrequency, setJobFrequency] = useState<JobFrequency>("Daily");
  const [jobSchedule, setJobSchedule] = useState("06:00");
  const [jobSource, setJobSource] = useState("");

  useEffect(() => {
    if (sources.length > 0 && !jobSource) {
      setJobSource(sources[0].id);
    }
  }, [sources]);

  const resetForm = () => {
    setJobName("");
    setJobDescription("");
    setJobFrequency("Daily");
    setJobSchedule("06:00");
    setJobSource(sources.length > 0 ? sources[0].id : "");
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
        onJobCreated(newJob);
        setIsDialogOpen(false);
        resetForm();
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
  
  const renderScheduleInputs = () => {
    switch (jobFrequency) {
      case "Daily":
        return (
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
        );
        
      case "Weekly":
        return (
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
        );
        
      case "Monthly":
        return (
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
        );
        
      case "Once":
        return (
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
        );
        
      default:
        return null;
    }
  };

  const handleDialogOpen = () => {
    if (sources.length === 0) {
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

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2" onClick={handleDialogOpen}>
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
        
        {sources.length === 0 ? (
          <div className="py-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Data Sources Available</h3>
            <p className="text-muted-foreground mb-6">
              You need to connect a data source before you can create automated jobs.
            </p>
            <Button onClick={() => navigate("/sources")}>
              Go to My Sources
            </Button>
          </div>
        ) : (
          <>
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
              
              {renderScheduleInputs()}
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobDialog;
