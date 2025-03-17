
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { FileEdit } from "lucide-react";

interface CustomQueryEditorProps {
  customQuery: string;
  setCustomQuery: (query: string) => void;
}

const CustomQueryEditor: React.FC<CustomQueryEditorProps> = ({
  customQuery,
  setCustomQuery
}) => {
  return (
    <div className="border rounded-lg p-5">
      <div className="flex items-center mb-4">
        <div className="p-3 rounded-full mr-4 bg-blue-100 text-blue-600">
          <FileEdit className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-medium">Custom GraphQL Query</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Write a valid GraphQL query to extract data
          </p>
        </div>
      </div>
      
      <Textarea 
        placeholder="Enter your GraphQL query here..."
        className="font-mono h-60 resize-none"
        value={customQuery}
        onChange={(e) => setCustomQuery(e.target.value)}
      />
      
      <div className="mt-4">
        <h4 className="text-sm font-medium">Example Query:</h4>
        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto mt-2">
          {`{
  products(first: 10) {
    edges {
      node {
        id
        title
        description
        variants {
          edges {
            node {
              id
              price
            }
          }
        }
      }
    }
  }
}`}
        </pre>
      </div>
    </div>
  );
};

export default CustomQueryEditor;
