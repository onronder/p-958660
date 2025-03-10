
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface JobBasicFieldsProps {
  jobName: string;
  setJobName: (value: string) => void;
  jobDescription: string;
  setJobDescription: (value: string) => void;
}

const JobBasicFields = ({ 
  jobName, 
  setJobName, 
  jobDescription, 
  setJobDescription 
}: JobBasicFieldsProps) => {
  return (
    <>
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
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">
          Description
        </Label>
        <Input
          id="description"
          value={jobDescription || ''}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Sync orders daily (optional)"
          className="col-span-3"
        />
      </div>
    </>
  );
};

export default JobBasicFields;
