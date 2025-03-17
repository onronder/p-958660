
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Source } from "@/types/source";
import { Card } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

interface SourceSelectionStepProps {
  sources: Source[];
  selectedSourceId: string;
  onSelectSource: (id: string, name: string) => void;
}

const SourceSelectionStep: React.FC<SourceSelectionStepProps> = ({
  sources,
  selectedSourceId,
  onSelectSource
}) => {
  if (sources.length === 0) {
    return (
      <div className="text-center py-6">
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
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select Data Source</h2>
      <p className="text-muted-foreground">
        Choose the data source you want to extract data from.
      </p>
      
      <RadioGroup 
        value={selectedSourceId}
        onValueChange={(value) => {
          const source = sources.find(s => s.id === value);
          if (source) {
            onSelectSource(value, source.name);
          }
        }}
        className="space-y-3 mt-4"
      >
        {sources.map((source) => (
          <div key={source.id}>
            <RadioGroupItem
              value={source.id}
              id={source.id}
              className="peer sr-only"
            />
            <Label
              htmlFor={source.id}
              className="peer-data-[state=checked]:border-primary flex flex-col items-start cursor-pointer rounded-lg border p-4 hover:bg-muted/50 peer-data-[state=checked]:bg-muted"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center">
                  <ShoppingBag className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">{source.name}</span>
                </div>
                <div className="text-muted-foreground text-sm mt-1">
                  {source.url}
                </div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default SourceSelectionStep;
