
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Play, Pause, Clock } from "lucide-react";

const jobs = [
  {
    name: "Daily Order Sync",
    source: "Fashion Boutique",
    schedule: "Daily at 06:00 AM",
    lastRun: "2023-11-22 06:00 AM",
    nextRun: "2023-11-23 06:00 AM",
    status: "Active",
  },
  {
    name: "Weekly Products Update",
    source: "Tech Gadgets",
    schedule: "Weekly on Monday",
    lastRun: "2023-11-20 07:00 AM",
    nextRun: "2023-11-27 07:00 AM",
    status: "Active",
  },
  {
    name: "Monthly Customer Import",
    source: "Home Decor",
    schedule: "Monthly on 1st",
    lastRun: "2023-11-01 08:00 AM",
    nextRun: "2023-12-01 08:00 AM",
    status: "Paused",
  },
];

const Jobs = () => {
  return (
    <div className="space-y-8">
      <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-4 mb-4">
        <div className="text-blue-500 mt-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-blue-800">
            <span className="font-bold">⚡ The Jobs</span> page allows you to schedule and manage automated data extraction and transformation tasks, ensuring your data is always up-to-date.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Jobs</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Job
        </Button>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Scheduled Jobs</h3>
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
            {jobs.map((job, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{job.name}</TableCell>
                <TableCell>{job.source}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{job.schedule}</span>
                  </div>
                </TableCell>
                <TableCell>{job.lastRun}</TableCell>
                <TableCell>{job.nextRun}</TableCell>
                <TableCell>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.status === "Active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {job.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {job.status === "Active" ? (
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <Pause className="h-4 w-4" />
                        <span className="ml-1">Pause</span>
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <Play className="h-4 w-4" />
                        <span className="ml-1">Resume</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Jobs;
