
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Calendar, FileType } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface DestinationProps {
  destination: {
    id: string;
    name: string;
    type: string;
    status: string;
    exportFormat: string;
    schedule: string;
    lastExport: string | null;
  };
  onTestConnection: (id: string) => void;
  onDelete: (id: string) => void;
}

const DestinationCard: React.FC<DestinationProps> = ({ 
  destination, 
  onTestConnection, 
  onDelete 
}) => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{destination.name}</h3>
              <StatusBadge status={destination.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">{destination.type}</p>
          </div>
        </div>
        
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FileType className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Format:</span>
            </div>
            <span className="font-medium">{destination.exportFormat}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Schedule:</span>
            </div>
            <span className="font-medium">{destination.schedule}</span>
          </div>
          
          {destination.lastExport && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Export:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-medium cursor-help">
                      {formatDistanceToNow(new Date(destination.lastExport), { addSuffix: true })}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{new Date(destination.lastExport).toLocaleString()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between mt-6 pt-4 border-t border-border">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onTestConnection(destination.id)}
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
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(destination.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "Failed":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} font-medium`} variant="outline">
      {status}
    </Badge>
  );
};

export default DestinationCard;
