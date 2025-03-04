
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import SourceStatusBadge from "@/components/SourceStatusBadge";
import { Source } from "@/types/source";
import { formatDate, testShopifyConnection } from "@/services/sourcesService";

interface SourceCardProps {
  source: Source;
  onTestConnection: (sourceId: string) => void;
  onDelete: (sourceId: string) => void;
}

const SourceCard: React.FC<SourceCardProps> = ({ 
  source, 
  onTestConnection, 
  onDelete 
}) => {
  const handleTestConnection = () => {
    // Use the new test function for Shopify sources
    if (source.source_type === "Shopify" && source.credentials?.access_token) {
      // The onTestConnection function will handle the OAuth testing
    }
    onTestConnection(source.id);
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{source.name}</h3>
              <SourceStatusBadge status={source.status} />
            </div>
            <p className="text-sm text-muted-foreground">{source.url}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">{source.source_type}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Sync:</span>
              <span className="font-medium">{formatDate(source.last_sync)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-6 pt-4 border-t border-border">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleTestConnection}
        >
          Test Connection
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive"
            onClick={() => onDelete(source.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SourceCard;
