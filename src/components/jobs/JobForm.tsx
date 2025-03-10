
import React, { useState, useEffect } from 'react';
import { JobFrequency } from '@/types/job';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { createJob, calculateNextRun } from '@/services/jobSchedulerService';
import { useTransformations } from '@/hooks/useTransformations';
import { useDestinations } from '@/hooks/useDestinations';

import JobBasicFields from './JobBasicFields';
import JobSourceSelect from './JobSourceSelect';
import JobTransformationSelect from './JobTransformationSelect';
import JobDestinationSelect from './JobDestinationSelect';
import JobFrequencySelect from './JobFrequencySelect';
import JobScheduleInput from './JobScheduleInput';

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
  const [transformationId, setTransformationId] = useState("none");
  const [destinationId, setDestinationId] = useState("none");
  
  const { transformations = [], isLoading: transformationsLoading } = useTransformations();
  const { destinations = [], isLoading: destinationsLoading } = useDestinations();

  // Set default source when sources are loaded
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
        transformation_id: transformationId === "none" ? null : transformationId,
        destination_id: destinationId === "none" ? null : destinationId,
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
  
  return (
    <>
      <div className="grid gap-4 py-4">
        <JobBasicFields 
          jobName={jobName}
          setJobName={setJobName}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
        />
        
        <JobSourceSelect 
          sources={sources || []}
          jobSource={jobSource}
          setJobSource={setJobSource}
        />
        
        <JobTransformationSelect 
          transformations={transformations || []}
          transformationId={transformationId}
          setTransformationId={setTransformationId}
          sourceId={jobSource}
          isLoading={transformationsLoading}
        />
        
        <JobDestinationSelect 
          destinations={destinations || []}
          destinationId={destinationId}
          setDestinationId={setDestinationId}
          isLoading={destinationsLoading}
        />
        
        <JobFrequencySelect 
          jobFrequency={jobFrequency}
          setJobFrequency={setJobFrequency}
        />
        
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
