
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Trash2, 
  RefreshCw,
  ExternalLink
} from "lucide-react";
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
import { useNavigate } from "react-router-dom";

interface DestinationActionsProps {
  id: string;
  name: string;
  status: "Active" | "Pending" | "Failed" | "Deleted";
  onTestConnection: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onExport: () => void;
  onRetry: () => void;
  isExporting?: boolean;
  isTesting?: boolean;
}

const DestinationActions: React.FC<DestinationActionsProps> = ({
  id,
  name,
  status,
  onTestConnection,
  onDelete,
  onEdit,
  onExport,
  onRetry,
  isExporting = false,
  isTesting = false
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleExportNow = () => {
    // Navigate to Jobs page with state that indicates which destination to pre-select
    navigate("/jobs", { 
      state: { 
        openCreateJob: true,
        preSelectedDestination: {
          id,
          name
        }
      } 
    });
  };
  
  return (
    <>
      <div className="flex justify-between mt-6 pt-4 border-t border-border">
        {status === "Failed" ? (
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
            disabled={isTesting || status === "Deleted"}
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
                  disabled={isExporting || status === "Deleted"}
                  onClick={handleExportNow}
                >
                  {isExporting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isExporting ? "Exporting..." : "Create Export Job"}</p>
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
                  onClick={onEdit}
                  disabled={status === "Deleted"}
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
                <p>{status === "Deleted" ? "Permanently Delete" : "Delete"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {status === "Deleted" ? "Permanently Delete Destination" : "Delete Destination"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {status === "Deleted" 
                ? "Are you sure you want to permanently delete this destination? This action cannot be undone."
                : "Are you sure you want to delete this destination? It will be moved to the Deleted filter for 30 days before being permanently removed."}
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
              {status === "Deleted" ? "Permanently Delete" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DestinationActions;
