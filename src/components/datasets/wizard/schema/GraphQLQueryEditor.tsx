
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface GraphQLQueryEditorProps {
  query: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const GraphQLQueryEditor: React.FC<GraphQLQueryEditorProps> = ({
  query,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">GraphQL Query</label>
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
