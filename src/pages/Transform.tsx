
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash } from "lucide-react";

const transformations = [
  {
    name: "Order Transformation",
    source: "Orders",
    lastModified: "2023-11-22",
    status: "Active",
  },
  {
    name: "Customer Insights",
    source: "Customers",
    lastModified: "2023-11-20",
    status: "Inactive",
  },
];

const Transform = () => {
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
            <span className="font-bold">⚡ The Transformation</span> page enables you to create and manage data transformation rules and operations, ensuring your data is optimized for your specific needs.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Transformations</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Transformation
        </Button>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Saved Transformations</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transformations.map((transformation, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{transformation.name}</TableCell>
                <TableCell>{transformation.source}</TableCell>
                <TableCell>{transformation.lastModified}</TableCell>
                <TableCell>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transformation.status === "Active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {transformation.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <Edit className="h-4 w-4" />
                      <span className="ml-1">Edit</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500 hover:text-red-600">
                      <Trash className="h-4 w-4" />
                      <span className="ml-1">Delete</span>
                    </Button>
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

export default Transform;
