
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useGraphQLSchema } from "@/hooks/datasets/useGraphQLSchema";
import GraphQLQueryEditor from "./schema/GraphQLQueryEditor";
import GraphQLSchemaExplorer from "./schema/GraphQLSchemaExplorer";

interface CustomDatasetStepProps {
  sourceId: string;
  query: string;
  onQueryChange: (query: string) => void;
}

const CustomDatasetStep: React.FC<CustomDatasetStepProps> = ({
  sourceId,
  query,
  onQueryChange
}) => {
  const { isLoading, schema, loadSchema } = useGraphQLSchema(sourceId);
  
  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onQueryChange(e.target.value);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Custom GraphQL Query</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={loadSchema}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh Schema
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GraphQLQueryEditor 
          query={query}
          onChange={handleQueryChange}
        />
        
        <GraphQLSchemaExplorer 
          isLoading={isLoading}
          schema={schema}
        />
      </div>
    </div>
  );
};

export default CustomDatasetStep;
