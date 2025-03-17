
import React, { useState, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
  const [isLoading, setIsLoading] = useState(false);
  const [schema, setSchema] = useState<any>(null);
  
  const loadSchema = useCallback(async () => {
    if (!sourceId) return;
    
    try {
      setIsLoading(true);
      
      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No authenticated session");
      }
      
      // Call the Shopify schema edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopify-schema`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          source_id: sourceId,
          api_version: "2023-10" // Could be made configurable
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load schema");
      }
      
      const data = await response.json();
      setSchema(data.schema);
    } catch (error) {
      console.error("Error loading schema:", error);
      toast({
        title: "Error",
        description: "Failed to load GraphQL schema: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [sourceId]);
  
  useEffect(() => {
    loadSchema();
  }, [loadSchema]);
  
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
        <div className="space-y-2">
          <label className="text-sm font-medium">GraphQL Query</label>
          <Textarea 
            placeholder="Enter your GraphQL query here..."
            className="font-mono h-80 resize-none"
            value={query}
            onChange={handleQueryChange}
          />
          <p className="text-xs text-muted-foreground">
            Write a valid GraphQL query to extract data. Include variables if needed.
          </p>
        </div>
        
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
      </div>
    </div>
  );
};

export default CustomDatasetStep;
