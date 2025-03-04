
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import JobStatusBadge from "./JobStatusBadge";

export interface Job {
  source: string;
  startDate: string;
  duration: string;
  rowsProcessed: number;
  status: "Success" | "Failed" | "Running" | "Pending";
}

interface RecentJobsTableProps {
  jobs: Job[];
}

const RecentJobsTable = ({ jobs }: RecentJobsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Source</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Rows Processed</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job, index) => (
          <TableRow key={index}>
            <TableCell>{job.source}</TableCell>
            <TableCell>{job.startDate}</TableCell>
            <TableCell>{job.duration}</TableCell>
            <TableCell>{job.rowsProcessed.toLocaleString()}</TableCell>
            <TableCell>
              <JobStatusBadge status={job.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RecentJobsTable;
