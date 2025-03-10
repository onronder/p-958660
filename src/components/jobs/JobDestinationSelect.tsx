
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Destination } from '@/hooks/destinations/types';

interface JobDestinationSelectProps {
  destinations: Destination[];
  destinationId: string;
  setDestinationId: (value: string) => void;
  isLoading: boolean;
}

const JobDestinationSelect = ({ 
  destinations = [], 
  destinationId, 
  setDestinationId,
  isLoading
}: JobDestinationSelectProps) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="destination" className="text-right">
        Destination
      </Label>
      <Select 
        value={destinationId} 
        onValueChange={setDestinationId}
      >
        <SelectTrigger className="col-span-3" disabled={isLoading}>
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
  );
};

export default JobDestinationSelect;
