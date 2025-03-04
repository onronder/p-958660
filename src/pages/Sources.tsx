
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Plus } from "lucide-react";

const sources = [
  {
    name: "Fashion Boutique",
    url: "https://fashion-boutique.myshopify.com",
    status: "Active",
  },
  {
    name: "Tech Gadgets",
    url: "https://tech-gadgets.myshopify.com",
    status: "Inactive",
  },
  {
    name: "Home Decor",
    url: "https://home-decor.myshopify.com",
    status: "Active",
  },
];

const Sources = () => {
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
            <span className="font-bold">⚡ The My Sources</span> page allows you to connect and manage your data sources, such as Shopify or other platforms, ensuring seamless integration for data extraction and processing.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">My Sources</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Source
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map((source, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{source.name}</h3>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      source.status === "Active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {source.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{source.url}</p>
              </div>
              <Button variant="ghost" size="sm" className="px-2">
                <Edit className="h-4 w-4" />
                <span className="ml-1">Edit</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Sources;
