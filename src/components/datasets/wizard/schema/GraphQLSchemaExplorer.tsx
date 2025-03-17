
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Database, FileJson, Layers, Loader2 } from "lucide-react";

interface GraphQLSchemaExplorerProps {
  isLoading: boolean;
  schema: any;
}

const GraphQLSchemaExplorer: React.FC<GraphQLSchemaExplorerProps> = ({
  isLoading,
  schema
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Schema Explorer</label>
        </div>
        <div className="border rounded-md p-4 h-80">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm">Loading GraphQL schema...</p>
          </div>
          
          <div className="space-y-2 mt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Schema Explorer</label>
        </div>
        <div className="border rounded-md p-4 h-80 flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground">
          <Database className="h-8 w-8 mb-2" />
          <p className="text-sm">No schema loaded</p>
          <p className="text-xs">Click "Refresh Schema" to load the GraphQL schema</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Schema Explorer</label>
      <ScrollArea className="border rounded-md p-4 h-80">
        <div className="space-y-3">
          {renderSchema(schema)}
        </div>
      </ScrollArea>
      <p className="text-xs text-muted-foreground">
        Explore the available GraphQL types and fields to build your query.
      </p>
    </div>
  );
};

const renderSchema = (schema: any) => {
  if (!schema || !schema.__schema) {
    return <p className="text-sm text-muted-foreground">Invalid schema format</p>;
  }

  const { types, queryType } = schema.__schema;
  
  // Find the main Query type
  const mainQueryType = types.find(
    (type: any) => type.name === queryType.name
  );
  
  if (!mainQueryType) {
    return <p className="text-sm text-muted-foreground">Query type not found</p>;
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-1 font-medium">
        <Layers className="h-4 w-4 text-primary" />
        <span>Query Root</span>
      </div>
      
      <div className="pl-4 space-y-2 border-l border-muted">
        {mainQueryType.fields?.map((field: any) => (
          <div key={field.name} className="space-y-1">
            <div className="flex items-center text-sm">
              <ChevronRight className="h-3 w-3 mr-1" />
              <span className="font-medium">{field.name}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {renderTypeReference(field.type)}
              </span>
            </div>
            
            {field.args?.length > 0 && (
              <div className="pl-6 text-xs">
                <div className="text-muted-foreground">Arguments:</div>
                <div className="pl-2 space-y-1">
                  {field.args.map((arg: any) => (
                    <div key={arg.name} className="flex items-center">
                      <FileJson className="h-3 w-3 mr-1 text-amber-500" />
                      <span className="font-medium">{arg.name}</span>
                      <span className="text-muted-foreground ml-1">
                        {renderTypeReference(arg.type)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const renderTypeReference = (type: any): string => {
  if (type.kind === 'NON_NULL') {
    return `${renderTypeReference(type.ofType)}!`;
  } else if (type.kind === 'LIST') {
    return `[${renderTypeReference(type.ofType)}]`;
  } else {
    return type.name;
  }
};

export default GraphQLSchemaExplorer;
