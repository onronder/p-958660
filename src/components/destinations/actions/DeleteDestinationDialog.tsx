
import React from "react";
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

interface DeleteDestinationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: "Active" | "Pending" | "Failed" | "Deleted";
  onDelete: () => void;
}

const DeleteDestinationDialog: React.FC<DeleteDestinationDialogProps> = ({
  open,
  onOpenChange,
  status,
  onDelete,
}) => {
  const isPermanentDelete = status === "Deleted";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isPermanentDelete ? "Permanently Delete Destination" : "Delete Destination"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isPermanentDelete
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
              onOpenChange(false);
            }}
          >
            {isPermanentDelete ? "Permanently Delete" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDestinationDialog;
