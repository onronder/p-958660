
import React, { useState, useEffect } from 'react';
import { JobFrequency } from '@/types/job';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { createJob, calculateNextRun } from '@/services/jobSchedulerService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import JobScheduleInput from './JobScheduleInput';
import { useTransformations } from '@/hooks/useTransformations';
import { useDestinations } from '@/hooks/useDestinations';

interface Source {
  id: string;
  name: string;
}

interface JobFormProps {
  sources: Source[];
  onJobCreated: (newJob: any) => void;
  onCancel: () => void;
}

const JobForm = ({ sources, onJobCreated, onCancel }: JobFormProps) => {
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [jobName, setJobName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobFrequency, setJobFrequency] = useState<JobFrequency>("Daily");
  const [jobSchedule, setJobSchedule] = useState("06:00");
  const [jobSource, setJobSource] = useState("");
  const [transformationId, setTransformationId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  
  const { transformations = [], isLoading: transformationsLoading } = useTransformations();
  const { destinations = [], isLoading: destinationsLoading } = useDestinations();

  useEffect(() => {
    if (sources?.length > 0 && !jobSource) {
      setJobSource(sources[0].id);
    }
  }, [sources, jobSource]);

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
      const sourceName = sources?.find(s => s.id === jobSource)?.name || "";
      const nextRun = calculateNextRun(jobFrequency, jobSchedule);
      
      const newJob = await createJob({
        name: jobName,
        description: jobDescription,
        source_id: jobSource,
        source_name: sourceName,
        transformation_id: transformationId || null,
        destination_id: destinationId || null,
        frequency: jobFrequency,
        schedule: jobSchedule,
        next_run: nextRun,
        status: "Active"
      });

      if (newJob) {
        onJobCreated(newJob);
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
  
  // Filter transformations to only show those for the selected source
  const filteredTransformations = transformations.filter(
    t => t.source_id === jobSource
  );
  
  return (
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
              {sources?.map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="transformation" className="text-right">
            Transformation
          </Label>
          <Select 
            value={transformationId} 
            onValueChange={setTransformationId}
          >
            <SelectTrigger className="col-span-3" disabled={transformationsLoading}>
              <SelectValue placeholder="Select a transformation (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {filteredTransformations.map((transformation) => (
                <SelectItem key={transformation.id} value={transformation.id}>
                  {transformation.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="destination" className="text-right">
            Destination
          </Label>
          <Select 
            value={destinationId} 
            onValueChange={setDestinationId}
          >
            <SelectTrigger className="col-span-3" disabled={destinationsLoading}>
              <SelectValue placeholder="Select a destination (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {destinations.map((destination) => (
                <SelectItem key={destination.id} value={destination.id}>
                  {destination.name}
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
        
        <JobScheduleInput 
          frequency={jobFrequency} 
          schedule={jobSchedule} 
          onScheduleChange={setJobSchedule} 
        />
      </div>
      
      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
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
  );
};

export default JobForm;
