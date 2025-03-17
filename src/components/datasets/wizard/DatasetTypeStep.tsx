
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileIcon, FileLineChart, FileEdit } from "lucide-react";

interface DatasetTypeStepProps {
  selectedType: string;
  onSelectType: (type: "predefined" | "dependent" | "custom") => void;
}

const DatasetTypeStep: React.FC<DatasetTypeStepProps> = ({
  selectedType,
  onSelectType
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select Dataset Type</h2>
      <p className="text-muted-foreground">
        Choose how you want to extract your data.
      </p>
      
      <RadioGroup 
        value={selectedType}
        onValueChange={(value) => onSelectType(value as "predefined" | "dependent" | "custom")}
        className="space-y-3 mt-4"
      >
        <div>
          <RadioGroupItem
            value="predefined"
            id="predefined"
            className="peer sr-only"
          />
          <Label
            htmlFor="predefined"
            className="peer-data-[state=checked]:border-primary flex flex-col items-start cursor-pointer rounded-lg border p-4 hover:bg-muted/50 peer-data-[state=checked]:bg-muted"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center">
                <FileIcon className="h-4 w-4 mr-2 text-green-600" />
                <span className="font-medium">Predefined Data Sets</span>
              </div>
              <div className="text-muted-foreground text-sm mt-1">
                Ready-to-use templates for common data extraction needs. The simplest way to get started.
              </div>
            </div>
          </Label>
        </div>
        
        <div>
          <RadioGroupItem
            value="dependent"
            id="dependent"
            className="peer sr-only"
          />
          <Label
            htmlFor="dependent"
            className="peer-data-[state=checked]:border-primary flex flex-col items-start cursor-pointer rounded-lg border p-4 hover:bg-muted/50 peer-data-[state=checked]:bg-muted"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center">
                <FileLineChart className="h-4 w-4 mr-2 text-purple-600" />
                <span className="font-medium">Dependent Queries</span>
              </div>
              <div className="text-muted-foreground text-sm mt-1">
                Advanced templates that combine related data using multiple queries. Best for complex data relationships.
              </div>
            </div>
          </Label>
        </div>
        
        <div>
          <RadioGroupItem
            value="custom"
            id="custom"
            className="peer sr-only"
          />
          <Label
            htmlFor="custom"
            className="peer-data-[state=checked]:border-primary flex flex-col items-start cursor-pointer rounded-lg border p-4 hover:bg-muted/50 peer-data-[state=checked]:bg-muted"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center">
                <FileEdit className="h-4 w-4 mr-2 text-blue-600" />
                <span className="font-medium">Custom Dataset</span>
              </div>
              <div className="text-muted-foreground text-sm mt-1">
                Create your own custom query to extract exactly the data you need. Best for specific requirements.
              </div>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default DatasetTypeStep;
