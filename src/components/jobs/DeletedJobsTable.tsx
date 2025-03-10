
import React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw } from "lucide-react";
import { Job } from "@/types/job";
import JobStatusBadge from "./JobStatusBadge";

interface DeletedJobsTableProps {
  deletedJobs: Job[];
  onRestoreJob: (jobId: string) => Promise<void>;
  onPermanentDelete: (jobId: string) => Promise<void>;
}

const DeletedJobsTable = ({ deletedJobs, onRestoreJob, onPermanentDelete }: DeletedJobsTableProps) => {
  if (deletedJobs.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No deleted jobs found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Deleted</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deletedJobs.map((job) => (
          <TableRow key={job.id}>
            <TableCell className="font-medium">
              <div>
                <div>{job.name}</div>
                {job.description && (
                  <div className="text-xs text-muted-foreground mt-1">{job.description}</div>
                )}
              </div>
            </TableCell>
            <TableCell>{job.source_name}</TableCell>
            <TableCell>
              {job.deletion_marked_at && (
                <div className="flex flex-col">
                  <span>{format(new Date(job.deletion_marked_at), "PPp")}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(job.deletion_marked_at), { addSuffix: true })}
                  </span>
                </div>
              )}
            </TableCell>
            <TableCell>
              <JobStatusBadge status={job.status} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2"
                  onClick={() => onRestoreJob(job.id)}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="ml-1">Restore</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onPermanentDelete(job.id)}
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

export default DeletedJobsTable;
