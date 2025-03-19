
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCw } from "lucide-react";

interface SourceOption {
  id: string;
  name: string;
}

interface SourceSelectorProps {
  sources: SourceOption[];
  selectedSourceId: string;
  setSelectedSourceId: (id: string) => void;
  isLoadingSources: boolean;
  onRefresh: () => void;
}

const SourceSelector: React.FC<SourceSelectorProps> = ({
  sources,
  selectedSourceId,
  setSelectedSourceId,
  isLoadingSources,
  onRefresh
}) => {
  return (
    <div className="flex items-end gap-4">
      <div className="flex-1 space-y-2">
        <Label htmlFor="source">Shopify Source</Label>
        <Select
          value={selectedSourceId}
          onValueChange={setSelectedSourceId}
          disabled={isLoadingSources}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Shopify source" />
          </SelectTrigger>
          <SelectContent>
            {sources.map((source) => (
              <SelectItem key={source.id} value={source.id}>
                {source.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={isLoadingSources}
      >
        {isLoadingSources ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-2" />
        )}
        Refresh
      </Button>
    </div>
  );
};

export default SourceSelector;
