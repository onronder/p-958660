
import React from "react";
import { Loader2 } from "lucide-react";

interface GraphQLSchemaExplorerProps {
  isLoading: boolean;
  schema: any;
}

const GraphQLSchemaExplorer: React.FC<GraphQLSchemaExplorerProps> = ({
  isLoading,
  schema
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Schema Explorer</label>
      <div className="border rounded-md h-80 overflow-y-auto p-3 bg-muted/20 font-mono text-xs">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : schema ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Available Query Types:</p>
            {Object.keys(schema.categories).map((category) => (
              <div key={category} className="pb-2">
                <div className="font-bold text-primary">{category}</div>
                <ul className="pl-3 space-y-1">
                  {schema.categories[category].map((type: any) => (
                    <li key={type.name} className="text-muted-foreground">
                      {type.name}
                      {type.fields && (
                        <ul className="pl-3">
                          {type.fields.slice(0, 5).map((field: any) => (
                            <li key={field.name} className="text-xs">{field.name}</li>
                          ))}
                          {type.fields.length > 5 && (
                            <li className="text-xs text-muted-foreground">
                              ...and {type.fields.length - 5} more fields
                            </li>
                          )}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a data source to load the schema
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Browse the GraphQL schema to help build your query.
      </p>
    </div>
  );
};

export default GraphQLSchemaExplorer;
