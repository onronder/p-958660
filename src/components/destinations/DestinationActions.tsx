
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConnectionTestButton from "./actions/ConnectionTestButton";
import ActionButtons from "./actions/ActionButtons";
import DeleteDestinationDialog from "./actions/DeleteDestinationDialog";

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
        <ConnectionTestButton 
          status={status}
          onTestConnection={status === "Failed" ? onRetry : onTestConnection}
          isTesting={isTesting}
        />
        
        <ActionButtons 
          status={status}
          onEdit={onEdit}
          onExport={handleExportNow}
          onDelete={() => setDeleteDialogOpen(true)}
          isExporting={isExporting}
        />
      </div>
      
      <DeleteDestinationDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        status={status}
        onDelete={onDelete}
      />
    </>
  );
};

export default DestinationActions;
