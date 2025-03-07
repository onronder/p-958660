
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptySourcesStateProps {
  onAddSource?: () => void;
}

const EmptySourcesState: React.FC<EmptySourcesStateProps> = ({ onAddSource }) => {
  return (
    <Card className="p-10 flex flex-col items-center justify-center text-center">
      <div className="rounded-full bg-primary/10 p-3 mb-4">
        <div className="text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 19v-8.5a1 1 0 0 0-.4-.8l-7-5.25a1 1 0 0 0-1.2 0l-7 5.25a1 1 0 0 0-.4.8V19a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1z"></path>
          </svg>
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">No Sources Connected</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Connect your first data source to start extracting and transforming your data.
      </p>
      <Button onClick={onAddSource} className="flex items-center gap-2">
        <Plus className="h-4 w-4 mr-2" />
        Connect Your First Source
      </Button>
    </Card>
  );
};

export default EmptySourcesState;
