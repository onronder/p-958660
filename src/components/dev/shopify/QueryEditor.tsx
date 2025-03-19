
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface QueryEditorProps {
  query: string;
  setQuery: (query: string) => void;
  queryTemplates: {
    name: string;
    query: string;
  }[];
}

const QueryEditor: React.FC<QueryEditorProps> = ({
  query,
  setQuery,
  queryTemplates
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label htmlFor="query">GraphQL Query</Label>
        <div className="flex gap-2">
          {queryTemplates.map((template) => (
            <Button 
              key={template.name}
              variant="ghost" 
              size="sm"
              onClick={() => setQuery(template.query)}
            >
              {template.name}
            </Button>
          ))}
        </div>
      </div>
      <Textarea
        id="query"
        className="font-mono h-64"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your GraphQL query here..."
      />
    </div>
  );
};

export default QueryEditor;
