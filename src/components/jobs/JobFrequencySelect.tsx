
import React from 'react';
import { Label } from '@/components/ui/label';
import { JobFrequency } from '@/types/job';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface JobFrequencySelectProps {
  jobFrequency: JobFrequency;
  setJobFrequency: (value: JobFrequency) => void;
}

const JobFrequencySelect = ({ 
  jobFrequency, 
  setJobFrequency 
}: JobFrequencySelectProps) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="frequency" className="text-right">
        Frequency
      </Label>
      <Select 
        value={jobFrequency} 
        onValueChange={(value) => setJobFrequency(value as JobFrequency)}
      >
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
  );
};

export default JobFrequencySelect;
