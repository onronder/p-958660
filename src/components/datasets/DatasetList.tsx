
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DownloadCloud, 
  PlayCircle, 
  Trash, 
  FileJson, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dataset } from "@/types/dataset";
import { formatDistanceToNow } from "date-fns";

interface DatasetListProps {
  datasets: Dataset[];
  isLoading: boolean;
  onDownload: (id: string, format: string) => void;
  onRun: (id: string) => void;
  onDelete: (id: string) => void;
}

const DatasetList: React.FC<DatasetListProps> = ({
  datasets,
  isLoading,
  onDownload,
  onRun,
  onDelete
}) => {
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "running":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
            <Loader2 className="h-3 w-3 animate-spin" />
            Running
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {status}
          </Badge>
        );
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-8 w-[120px]" />
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Records</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {datasets.map((dataset) => (
            <TableRow key={dataset.id}>
              <TableCell className="font-medium">{dataset.name}</TableCell>
              <TableCell>
                {dataset.extraction_type === "predefined" && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Predefined
                  </Badge>
                )}
                {dataset.extraction_type === "dependent" && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    Dependent
                  </Badge>
                )}
                {dataset.extraction_type === "custom" && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Custom
                  </Badge>
                )}
              </TableCell>
              <TableCell>{dataset.record_count || "—"}</TableCell>
              <TableCell>{renderStatusBadge(dataset.status)}</TableCell>
              <TableCell>
                {dataset.completed_at ? (
                  formatDistanceToNow(new Date(dataset.completed_at), { addSuffix: true })
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  {dataset.status === "completed" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <DownloadCloud className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onDownload(dataset.id, "json")}>
                          <FileJson className="h-4 w-4 mr-2" />
                          <span>JSON</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDownload(dataset.id, "csv")}>
                          <FileText className="h-4 w-4 mr-2" />
                          <span>CSV</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  
                  {(dataset.status === "completed" || dataset.status === "failed") && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onRun(dataset.id)}
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Run
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:text-destructive/80"
                    onClick={() => onDelete(dataset.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DatasetList;
