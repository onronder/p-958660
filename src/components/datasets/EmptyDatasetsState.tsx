
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

export interface EmptyDatasetsStateProps {
  onCreate: () => void; // Add the onCreate prop
}

const EmptyDatasetsState: React.FC<EmptyDatasetsStateProps> = ({ onCreate }) => {
  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 rounded-full bg-primary-50 p-3">
        <PlusCircle className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-medium">No Datasets Found</h3>
      <p className="mb-6 text-sm text-muted-foreground">
        You haven't created any datasets yet. Create your first dataset to get started.
      </p>
      <Button onClick={onCreate}>Create Dataset</Button>
    </Card>
  );
};

export default EmptyDatasetsState;
