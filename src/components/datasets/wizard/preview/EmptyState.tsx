
import React from "react";
import { Database } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onGeneratePreview: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onGeneratePreview }) => {
  return (
    <div className="h-64 flex flex-col items-center justify-center space-y-4">
      <Database className="h-12 w-12 text-muted-foreground opacity-30" />
      <div className="text-center">
        <p className="text-muted-foreground">No preview data available.</p>
        <p className="text-sm text-muted-foreground mt-1">Try refreshing or adjusting your query.</p>
      </div>
      <Button onClick={onGeneratePreview} variant="outline">Generate Preview</Button>
    </div>
  );
};

export default EmptyState;
