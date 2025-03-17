
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCreateDataset } from "@/hooks/useCreateDataset";
import { FileIcon, FileLineChart, FileEdit } from "lucide-react";

const DatasetTypeSelect = () => {
  const navigate = useNavigate();
  const { datasetType, handleTypeSelect, sourceId } = useCreateDataset(() => {});
  
  const handleNext = () => {
    navigate("/create-dataset/details");
  };
  
  const handleBack = () => {
    navigate("/create-dataset/source");
  };
  
  const typeOptions = [
    {
      id: "predefined",
      title: "Predefined Datasets",
      description: "Ready-to-use templates for common data extraction needs. The simplest way to get started.",
      icon: <FileIcon className="h-10 w-10" />,
      color: "bg-green-100 text-green-600"
    },
    {
      id: "dependent",
      title: "Dependent Queries",
      description: "Advanced templates that combine related data using multiple queries. Best for complex data relationships.",
      icon: <FileLineChart className="h-10 w-10" />,
      color: "bg-purple-100 text-purple-600"
    },
    {
      id: "custom",
      title: "Custom Dataset",
      description: "Create your own custom query to extract exactly the data you need. Best for specific requirements.",
      icon: <FileEdit className="h-10 w-10" />,
      color: "bg-blue-100 text-blue-600"
    }
  ];
  
  // If no source is selected, redirect to source selection
  React.useEffect(() => {
    if (!sourceId) {
      navigate("/create-dataset/source");
    }
  }, [sourceId, navigate]);
  
  if (!sourceId) {
    return (
      <div className="p-8 text-center">
        <p>No data source selected. Redirecting to source selection...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Select Dataset Type</h2>
        <p className="text-muted-foreground mt-1">
          Choose how you want to extract your data.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {typeOptions.map((option) => (
          <div
            key={option.id}
            className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
              datasetType === option.id ? "border-primary ring-2 ring-primary/20" : ""
            }`}
            onClick={() => handleTypeSelect(option.id as "predefined" | "dependent" | "custom")}
          >
            <div className="flex items-center">
              <div className={`p-4 rounded-full mr-6 ${option.color}`}>
                {option.icon}
              </div>
              <div>
                <h3 className="font-medium text-lg">{option.title}</h3>
                <p className="text-muted-foreground mt-1">
                  {option.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between pt-4">
        <Button
          onClick={handleBack}
          variant="outline"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!datasetType}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default DatasetTypeSelect;
