
import React from "react";
import { FileType, Calendar, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DestinationDetailsProps {
  destination: {
    export_format: string;
    schedule: string;
    last_export: string | null;
    status: "Active" | "Pending" | "Failed";
  };
}

const DestinationDetails: React.FC<DestinationDetailsProps> = ({ destination }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <FileType className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Format:</span>
          </div>
          <span className="font-medium">{destination.export_format}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Schedule:</span>
          </div>
          <span className="font-medium">{destination.schedule}</span>
        </div>
        
        {destination.last_export && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last Export:</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium cursor-help">
                    {formatDistanceToNow(new Date(destination.last_export), { addSuffix: true })}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{new Date(destination.last_export).toLocaleString()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      
      {destination.status === "Failed" && (
        <div className="pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>Export failed. Please retry or check settings.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationDetails;
