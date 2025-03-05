
import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Job } from "@/types/job";
import JobTableRow from "./JobTableRow";

interface JobsTableProps {
  jobs: Job[];
  onToggleJobStatus: (job: Job) => Promise<void>;
  onRunNow: (job: Job) => Promise<void>;
  onDeleteJob: (jobId: string, jobName: string) => Promise<void>;
}

const JobsTable = ({ jobs, onToggleJobStatus, onRunNow, onDeleteJob }: JobsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Schedule</TableHead>
          <TableHead>Last Run</TableHead>
          <TableHead>Next Run</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <JobTableRow
            key={job.id}
            job={job}
            onToggleStatus={onToggleJobStatus}
            onRunNow={onRunNow}
            onDelete={onDeleteJob}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default JobsTable;
