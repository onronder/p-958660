
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { StepType } from '@/hooks/datasets/useCreateDatasetState';

interface CreateDatasetHeaderProps {
  currentStep: StepType;
  selectedSourceName?: string;
}

const CreateDatasetHeader: React.FC<CreateDatasetHeaderProps> = ({ 
  currentStep, 
  selectedSourceName 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/datasets")}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Create New Dataset</h1>
        
        {selectedSourceName && (
          <Badge variant="outline" className="ml-auto flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Source:</span> 
            <span className="font-medium">{selectedSourceName}</span>
          </Badge>
        )}
      </div>
      
      <p className="text-muted-foreground ml-10">
        {currentStep === 'source' && "Step 1: Select data source"}
        {currentStep === 'type' && "Step 2: Select dataset type"}
        {currentStep === 'configuration' && "Step 3: Configure dataset details"}
        {currentStep === 'templates' && "Step 4: Choose data to extract"}
        {currentStep === 'preview' && "Step 5: Preview and create dataset"}
      </p>
    </div>
  );
};

export default CreateDatasetHeader;
