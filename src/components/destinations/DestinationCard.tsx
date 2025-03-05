
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Trash2, 
  Calendar, 
  FileType, 
  RefreshCw, 
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DestinationProps {
  destination: {
    id: string;
    name: string;
    destination_type: string;
    status: "Active" | "Pending" | "Failed";
    export_format: string;
    schedule: string;
    last_export: string | null;
  };
  onTestConnection: () => void;
  onDelete: () => void;
  onExport: () => void;
  onRetry: () => void;
  isExporting?: boolean;
  isTesting?: boolean;
}

const DestinationCard: React.FC<DestinationProps> = ({ 
  destination, 
  onTestConnection, 
  onDelete,
  onExport,
  onRetry,
  isExporting = false,
  isTesting = false
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{destination.name}</h3>
              <StatusBadge status={destination.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">{destination.destination_type}</p>
          </div>
        </div>
        
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
      
      <div className="flex justify-between mt-6 pt-4 border-t border-border">
        {destination.status === "Failed" ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="text-destructive border-destructive hover:bg-destructive/10"
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </>
            )}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onTestConnection}
            disabled={isTesting}
          >
            {isTesting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>
        )}
        
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  disabled={isExporting}
                  onClick={onExport}
                >
                  {isExporting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isExporting ? "Exporting..." : "Export Now"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Destination</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this destination? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onDelete();
                setDeleteDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
