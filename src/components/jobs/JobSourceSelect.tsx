
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface Source {
  id: string;
  name: string;
}

interface JobSourceSelectProps {
  sources: Source[];
  jobSource: string;
  setJobSource: (value: string) => void;
}

const JobSourceSelect = ({ 
  sources, 
  jobSource, 
  setJobSource 
}: JobSourceSelectProps) => {
  return (
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
  );
};

export default JobSourceSelect;
