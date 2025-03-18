
import React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw } from "lucide-react";
import { Dataset } from "@/types/dataset";
import DatasetStatusBadge from "./DatasetStatusBadge";

interface DeletedDatasetsTableProps {
  deletedDatasets: Dataset[];
  onRestoreDataset: (datasetId: string) => Promise<void>;
  onPermanentDelete: (datasetId: string) => Promise<void>;
}

const DeletedDatasetsTable = ({ deletedDatasets, onRestoreDataset, onPermanentDelete }: DeletedDatasetsTableProps) => {
  if (deletedDatasets.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No deleted datasets found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Deleted</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deletedDatasets.map((dataset) => (
          <TableRow key={dataset.id}>
            <TableCell className="font-medium">
              <div>
                <div>{dataset.name}</div>
              </div>
            </TableCell>
            <TableCell>{dataset.extraction_type}</TableCell>
            <TableCell>
              {dataset.deletion_marked_at && (
                <div className="flex flex-col">
                  <span>{format(new Date(dataset.deletion_marked_at), "PPp")}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(dataset.deletion_marked_at), { addSuffix: true })}
                  </span>
                </div>
              )}
            </TableCell>
            <TableCell>
              <DatasetStatusBadge status={dataset.status} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2"
                  onClick={() => onRestoreDataset(dataset.id)}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="ml-1">Restore</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onPermanentDelete(dataset.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="ml-1">Delete Permanently</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DeletedDatasetsTable;
