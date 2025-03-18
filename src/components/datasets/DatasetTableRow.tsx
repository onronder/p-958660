
import React from "react";
import { format } from "date-fns";
import { TableRow, TableCell } from "@/components/ui/table";
import { Play, Download, Trash } from "lucide-react";
import { Dataset } from "@/types/dataset";
import DatasetStatusBadge from "./DatasetStatusBadge";
import { Button } from "@/components/ui/button";

interface DatasetTableRowProps {
  dataset: Dataset;
  onRunDataset: (dataset: Dataset) => Promise<void>;
  onDelete: (datasetId: string, datasetName: string) => Promise<void>;
}

const DatasetTableRow = ({ dataset, onRunDataset, onDelete }: DatasetTableRowProps) => {
  return (
    <TableRow key={dataset.id}>
      <TableCell className="font-medium">
        <div>
          <div>{dataset.name}</div>
        </div>
      </TableCell>
      <TableCell>{dataset.extraction_type}</TableCell>
      <TableCell>
        {dataset.completed_at 
          ? format(new Date(dataset.completed_at), "PPp") 
          : dataset.started_at 
            ? format(new Date(dataset.started_at), "PPp") 
            : "Not processed"}
      </TableCell>
      <TableCell>
        {dataset.record_count ? dataset.record_count.toLocaleString() : "-"}
      </TableCell>
      <TableCell>
        <DatasetStatusBadge status={dataset.status} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {dataset.status !== "running" && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2"
              onClick={() => onRunDataset(dataset)}
            >
              <Play className="h-4 w-4" />
              <span className="ml-1">Run</span>
            </Button>
          )}
          
          {dataset.status === "completed" && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2"
            >
              <Download className="h-4 w-4" />
              <span className="ml-1">Download</span>
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(dataset.id, dataset.name)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default DatasetTableRow;
