
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Database, FileType, ListTree, BarChart, Settings } from "lucide-react";

interface DatasetStepperProps {
  currentStep: number;
}

interface Step {
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const DatasetStepper: React.FC<DatasetStepperProps> = ({ currentStep }) => {
  const steps: Step[] = [
    {
      name: "Data Source",
      description: "Select your data source",
      icon: <Database className="h-6 w-6" />,
      path: "/create-dataset/source",
      color: "text-blue-500 bg-blue-100"
    },
    {
      name: "Dataset Type",
      description: "Choose extraction method",
      icon: <FileType className="h-6 w-6" />,
      path: "/create-dataset/type",
      color: "text-purple-500 bg-purple-100"
    },
    {
      name: "Dataset Details",
      description: "Configure dataset query",
      icon: <ListTree className="h-6 w-6" />,
      path: "/create-dataset/details",
      color: "text-amber-500 bg-amber-100"
    },
    {
      name: "Preview Data",
      description: "View sample results",
      icon: <BarChart className="h-6 w-6" />,
      path: "/create-dataset/preview",
      color: "text-green-500 bg-green-100"
    },
    {
      name: "Configure",
      description: "Finalize settings",
      icon: <Settings className="h-6 w-6" />,
      path: "/create-dataset/configure",
      color: "text-indigo-500 bg-indigo-100"
    }
  ];

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.name}>
            {/* Step indicator */}
            <div className="relative flex flex-col items-center">
              <div 
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full border-2",
                  currentStep === index 
                    ? "border-primary" 
                    : currentStep > index 
                      ? "border-green-500" 
                      : "border-gray-300",
                  step.color
                )}
              >
                {step.icon}
              </div>
              <div className="mt-2 w-32 text-center">
                <div className="text-sm font-medium">{step.name}</div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
            </div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  "flex-1 h-0.5 mx-2", 
                  currentStep > index ? "bg-green-500" : "bg-gray-300"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default DatasetStepper;
