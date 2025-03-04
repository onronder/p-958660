
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { File, Download, Trash } from "lucide-react";

const storedFiles = [
  {
    name: "orders_2023-11-22.csv",
    type: "CSV",
    size: "2.3 MB",
    created: "2023-11-22",
    source: "Orders",
  },
  {
    name: "products_catalog_full.json",
    type: "JSON",
    size: "4.8 MB",
    created: "2023-11-20",
    source: "Products",
  },
  {
    name: "customer_insights_q4.xlsx",
    type: "Excel",
    size: "1.7 MB",
    created: "2023-11-15",
    source: "Customers",
  },
];

const Storage = () => {
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
            <span className="font-bold">⚡ The Data Storage</span> page provides access to your stored data files, allowing you to manage, download, and analyze your transformed data.
          </p>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-primary">Data Storage</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Storage Usage</h3>
          <div className="flex items-end gap-2">
            <h2 className="text-3xl font-bold">8.8 GB</h2>
            <p className="text-muted-foreground text-sm mb-1">/ 10 GB</p>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-3">
            <div className="h-2 bg-blue-500 rounded-full" style={{ width: "88%" }}></div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">88% of your storage used</p>
          
          <div className="mt-6">
            <Button variant="outline" className="w-full">Upgrade Storage</Button>
          </div>
        </Card>
        
        <Card className="p-6 md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Storage by Type</h3>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground">CSV Files</p>
              <h4 className="text-xl font-bold mt-1">4.2 GB</h4>
              <p className="text-xs text-muted-foreground mt-1">48 files</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground">JSON Files</p>
              <h4 className="text-xl font-bold mt-1">3.1 GB</h4>
              <p className="text-xs text-muted-foreground mt-1">22 files</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Other</p>
              <h4 className="text-xl font-bold mt-1">1.5 GB</h4>
              <p className="text-xs text-muted-foreground mt-1">15 files</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Files</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {storedFiles.map((file, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{file.name}</span>
                  </div>
                </TableCell>
                <TableCell>{file.type}</TableCell>
                <TableCell>{file.size}</TableCell>
                <TableCell>{file.created}</TableCell>
                <TableCell>{file.source}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500 hover:text-red-600">
                      <Trash className="h-4 w-4" />
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

export default Storage;
