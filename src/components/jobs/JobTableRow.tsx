
import React from "react";
import { format } from "date-fns";
import { TableRow, TableCell } from "@/components/ui/table";
import { Clock } from "lucide-react";
import { Job } from "@/types/job";
import JobStatusBadge from "./JobStatusBadge";
import JobActions from "./JobActions";
import { getScheduleDisplay } from "./jobUtils";

interface JobTableRowProps {
  job: Job;
  onToggleStatus: (job: Job) => Promise<void>;
  onRunNow: (job: Job) => Promise<void>;
  onDelete: (jobId: string, jobName: string) => Promise<void>;
}

const JobTableRow = ({ job, onToggleStatus, onRunNow, onDelete }: JobTableRowProps) => {
  return (
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
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{getScheduleDisplay(job)}</span>
        </div>
      </TableCell>
      <TableCell>
        {job.last_run ? format(new Date(job.last_run), "PPp") : "Never"}
      </TableCell>
      <TableCell>
        {job.next_run ? format(new Date(job.next_run), "PPp") : "Not scheduled"}
      </TableCell>
      <TableCell>
        <JobStatusBadge status={job.status} />
      </TableCell>
      <TableCell>
        <JobActions 
          job={job}
          onToggleStatus={onToggleStatus}
          onRunNow={onRunNow}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};

export default JobTableRow;
