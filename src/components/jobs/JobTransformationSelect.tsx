
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Transformation } from '@/types/transformation';

interface JobTransformationSelectProps {
  transformations: Transformation[];
  transformationId: string;
  setTransformationId: (value: string) => void;
  sourceId: string;
  isLoading: boolean;
}

const JobTransformationSelect = ({ 
  transformations, 
  transformationId, 
  setTransformationId,
  sourceId,
  isLoading
}: JobTransformationSelectProps) => {
  // Filter transformations to only show those for the selected source
  const filteredTransformations = transformations.filter(
    t => t.source_id === sourceId
  );
  
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="transformation" className="text-right">
        Transformation
      </Label>
      <Select 
        value={transformationId} 
        onValueChange={setTransformationId}
      >
        <SelectTrigger className="col-span-3" disabled={isLoading}>
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
  );
};

export default JobTransformationSelect;
