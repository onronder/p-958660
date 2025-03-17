
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlayCircle, Loader2 } from "lucide-react";

interface GraphQLQueryEditorProps {
  query: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onRun?: () => void;
  isRunning?: boolean;
}

const GraphQLQueryEditor: React.FC<GraphQLQueryEditorProps> = ({
  query,
  onChange,
  onRun,
  isRunning = false
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">GraphQL Query</label>
        {onRun && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRun}
            disabled={isRunning}
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <PlayCircle className="h-4 w-4 mr-2" />
            )}
            {isRunning ? "Running..." : "Run Query"}
          </Button>
        )}
      </div>
      
      <Textarea 
        placeholder="Enter your GraphQL query here..."
        className="font-mono h-80 resize-none"
        value={query}
        onChange={onChange}
      />
      
      <p className="text-xs text-muted-foreground">
        Write a valid GraphQL query to extract data. Include variables if needed.
      </p>
    </div>
  );
};

export default GraphQLQueryEditor;
