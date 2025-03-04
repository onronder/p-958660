
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical } from "lucide-react";

const destinations = [
  {
    name: "FTP Server",
    type: "FTP/SFTP",
    status: "Connected",
  },
  {
    name: "Google Drive Backup",
    type: "Google Drive",
    status: "Disconnected",
  },
  {
    name: "OneDrive Sync",
    type: "Microsoft OneDrive",
    status: "Connected",
  },
];

const Destinations = () => {
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
            <span className="font-bold">⚡ The My Destinations</span> page allows you to configure and manage where processed data will be sent, ensuring seamless integration with target systems or platforms.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">My Destinations</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Destination
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((destination, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{destination.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{destination.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div 
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      destination.status === "Connected" ? "bg-green-500" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        destination.status === "Connected" ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </div>
                  <span className="ml-2 text-sm">
                    {destination.status}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Destinations;
