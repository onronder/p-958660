
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Clock, Database, Upload } from "lucide-react";

const statsData = [
  {
    title: "Service Uptime",
    value: "99.8%",
    description: "Last 24 hours",
    icon: PieChart,
    iconColor: "text-green-500",
  },
  {
    title: "New Data Rows",
    value: "10,345",
    description: "Rows pulled from Shopify",
    icon: Database,
    iconColor: "text-blue-500",
  },
  {
    title: "Pull Duration",
    value: "00:15:30",
    description: "Last pull",
    icon: Clock,
    iconColor: "text-yellow-500",
  },
  {
    title: "Upload Status",
    value: "85%",
    description: "Uploaded successfully",
    icon: Upload,
    iconColor: "text-purple-500",
  },
];

const recentJobs = [
  {
    source: "Orders",
    startDate: "2023-11-22",
    duration: "00:15:30",
    rowsProcessed: 10345,
    status: "Success",
  },
  {
    source: "Products",
    startDate: "2023-11-22",
    duration: "00:10:15",
    rowsProcessed: 3345,
    status: "Success",
  },
  {
    source: "Customers",
    startDate: "2023-11-21",
    duration: "00:12:45",
    rowsProcessed: 1234,
    status: "Failed",
  },
];

const Dashboard = () => {
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
            <span className="font-bold">⚡ The Dashboard</span> provides a centralized view of your data integration processes, offering key performance metrics, recent activity, and insights to help you monitor and manage your workflows effectively.
          </p>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-primary">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <h2 className="text-3xl font-bold mt-1">{stat.value}</h2>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
              <div className={`p-2 rounded-full ${stat.iconColor} bg-opacity-10`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Jobs</h3>
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
              {recentJobs.map((job, index) => (
                <TableRow key={index}>
                  <TableCell>{job.source}</TableCell>
                  <TableCell>{job.startDate}</TableCell>
                  <TableCell>{job.duration}</TableCell>
                  <TableCell>{job.rowsProcessed.toLocaleString()}</TableCell>
                  <TableCell>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        job.status === "Success" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {job.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
