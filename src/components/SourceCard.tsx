
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import SourceStatusBadge from "@/components/SourceStatusBadge";
import { Source } from "@/types/source";
import { formatDate } from "@/services/sourcesService";

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
  return (
    <Card className="p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{source.name}</h3>
              <SourceStatusBadge status={source.status} />
            </div>
            <p className="text-sm text-muted-foreground">{source.url}</p>
          </div>
          
          <div className="space-y-2.5 mt-4">
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
          onClick={() => onTestConnection(source.id)}
        >
          Test Connection
        </Button>
        <div className="flex gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
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
