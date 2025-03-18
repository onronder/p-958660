
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useGraphQLSchema } from "@/hooks/datasets/useGraphQLSchema";
import GraphQLQueryEditor from "./schema/GraphQLQueryEditor";
import GraphQLSchemaExplorer from "./schema/GraphQLSchemaExplorer";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const { isLoading, schema, error, loadSchema } = useGraphQLSchema(sourceId);
  const [isRunning, setIsRunning] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  
  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onQueryChange(e.target.value);
  };
  
  const handleRunQuery = async () => {
    if (!sourceId || !query.trim()) {
      toast({
        title: "Error",
        description: "Both source and query are required to run a test query",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsRunning(true);
      setPreviewData(null);
      
      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No authenticated session");
      }
      
      // Call the shopify-extract edge function with preview_only flag
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopify-extract`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          extraction_id: "preview", // Temporary ID for preview
          source_id: sourceId,
          custom_query: query,
          preview_only: true,
          limit: l5 // Limit to 5 results for preview
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to run query");
      }
      
      const data = await response.json();
      
      if (data.results) {
        setPreviewData(data.results);
        toast({
          title: "Query executed successfully",
          description: `Retrieved ${data.results.length} records`,
        });
      } else {
        toast({
          title: "Warning",
          description: "Query executed but returned no results",
          variant: "default",
        });
        setPreviewData([]);
      }
    } catch (error) {
      console.error("Error running query:", error);
      toast({
        title: "Error",
        description: "Failed to run query: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Fix: Wrap the loadSchema function in a handler that doesn't pass parameters
  const handleRefreshSchema = () => {
    loadSchema(true); // Force refresh the schema
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Custom GraphQL Query</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefreshSchema}
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
        <div className="space-y-4">
          <GraphQLQueryEditor 
            query={query}
            onChange={handleQueryChange}
            onRun={handleRunQuery}
            isRunning={isRunning}
          />
          
          {previewData && (
            <div className="border rounded-md p-4 mt-4">
              <h3 className="text-sm font-medium mb-2">Preview Results ({previewData.length})</h3>
              <div className="max-h-64 overflow-y-auto bg-muted/50 rounded">
                <pre className="text-xs p-2 whitespace-pre-wrap">
                  {JSON.stringify(previewData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
        
        <GraphQLSchemaExplorer 
          isLoading={isLoading}
          schema={schema}
          error={error}
        />
      </div>
    </div>
  );
};

export default CustomDatasetStep;
