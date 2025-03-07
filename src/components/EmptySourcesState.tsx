
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Home } from "lucide-react";

interface EmptySourcesStateProps {
  onAddSource?: () => void;
}

const EmptySourcesState: React.FC<EmptySourcesStateProps> = ({ onAddSource }) => {
  return (
    <Card className="p-10 flex flex-col items-center justify-center text-center">
      <div className="rounded-full bg-primary/10 p-3 mb-4">
        <div className="text-primary">
          <Home className="h-6 w-6" />
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
