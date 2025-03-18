
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertTriangle,
  CircleHelp,
  CircleX
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GraphQLSchemaExplorerProps {
  isLoading: boolean;
  schema: any;
  error?: string | null;
}

const GraphQLSchemaExplorer: React.FC<GraphQLSchemaExplorerProps> = ({
  isLoading,
  schema,
  error
}) => {
  if (isLoading) {
    return (
      <div className="border rounded-md p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Error loading schema: {error}. Please refresh and try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (!schema) {
    return (
      <div className="border rounded-md p-6 text-center space-y-3">
        <CircleHelp className="h-12 w-12 mx-auto text-muted-foreground/60" />
        <div>
          <h3 className="text-lg font-medium">No Schema Available</h3>
          <p className="text-sm text-muted-foreground mt-1">
            The GraphQL schema hasn't been loaded yet. 
            <br />Try refreshing the schema or check connection settings.
          </p>
        </div>
      </div>
    );
  }

  // Process schema for display - extract types from the schema
  const types = schema?.__schema?.types || [];
  const queryType = types.find(t => 
    t.kind === "OBJECT" && t.name === schema?.__schema?.queryType?.name
  );

  const queryFields = queryType?.fields || [];

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 border-b">
        <h3 className="font-medium">Shopify GraphQL Schema</h3>
      </div>
      
      <div className="p-4 max-h-[400px] overflow-y-auto">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Available Queries</h4>
            {queryFields.length > 0 ? (
              <ul className="space-y-1">
                {queryFields.map(field => (
                  <li key={field.name} className="text-sm">
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                      {field.name}
                    </span>
                    {field.description && (
                      <span className="text-muted-foreground ml-2 text-xs">
                        {field.description}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No query fields found in schema</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphQLSchemaExplorer;
