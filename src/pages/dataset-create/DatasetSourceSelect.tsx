
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Source } from "@/types/source";
import { useCreateDataset } from "@/hooks/useCreateDataset";
import { ShoppingBag, Database, Server } from "lucide-react";

const DatasetSourceSelect = () => {
  const navigate = useNavigate();
  const { sources, sourceId, setSourceId, setSourceName } = useCreateDataset(() => {});
  
  const handleSourceSelect = (id: string, name: string) => {
    setSourceId(id);
    setSourceName(name);
    navigate("/create-dataset/type");
  };
  
  // Function to get a random color class for the icon background
  const getRandomColorClass = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-purple-100 text-purple-600",
      "bg-green-100 text-green-600",
      "bg-amber-100 text-amber-600",
      "bg-indigo-100 text-indigo-600",
      "bg-rose-100 text-rose-600",
    ];
    return colors[index % colors.length];
  };
  
  // Function to get an icon based on source type
  const getSourceIcon = (source: Source) => {
    if (source.source_type === "shopify") {
      return <ShoppingBag className="h-8 w-8" />;
    } else if (source.source_type === "database") {
      return <Database className="h-8 w-8" />;
    }
    return <Server className="h-8 w-8" />;
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Select Data Source</h2>
        <p className="text-muted-foreground mt-1">
          Choose the data source you want to extract data from.
        </p>
      </div>
      
      {sources.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/20">
          <div className="rounded-full bg-amber-100 p-3 w-12 h-12 flex items-center justify-center mx-auto">
            <ShoppingBag className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="mt-3 text-lg font-semibold">No data sources available</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            You need to connect a data source before creating a dataset.
          </p>
          <a 
            href="/sources" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Connect Data Source
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map((source, index) => (
            <div
              key={source.id}
              className={`border rounded-lg p-5 cursor-pointer transition-all hover:shadow-md ${
                sourceId === source.id ? "border-primary ring-2 ring-primary/20" : ""
              }`}
              onClick={() => handleSourceSelect(source.id, source.name)}
            >
              <div className="flex items-start">
                <div className={`p-3 rounded-full mr-4 ${getRandomColorClass(index)}`}>
                  {getSourceIcon(source)}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{source.name}</h3>
                  <p className="text-sm text-muted-foreground">{source.url}</p>
                  <div className="text-xs mt-2 inline-block bg-muted px-2 py-1 rounded">
                    {source.source_type}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-end pt-4">
        <Button
          onClick={() => navigate("/my-datasets")}
          variant="outline"
          className="mr-2"
        >
          Cancel
        </Button>
        <Button
          onClick={() => navigate("/create-dataset/type")}
          disabled={!sourceId}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default DatasetSourceSelect;
