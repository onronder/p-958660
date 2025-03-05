
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DestinationCard from "@/components/destinations/DestinationCard";
import AddDestinationModal from "@/components/destinations/AddDestinationModal";
import DestinationsInfoBanner from "@/components/destinations/DestinationsInfoBanner";
import EmptyStateCard from "@/components/EmptyStateCard";
import { Database } from "lucide-react";

// Temporary data to mock destinations until we connect to Supabase
const initialDestinations = [
  {
    id: "1",
    name: "FTP Server",
    type: "FTP/SFTP",
    status: "Active",
    exportFormat: "CSV",
    schedule: "Manual",
    lastExport: "2024-07-10T15:30:00Z"
  },
  {
    id: "2",
    name: "Google Drive Backup",
    type: "Google Drive",
    status: "Failed",
    exportFormat: "JSON",
    schedule: "Weekly",
    lastExport: null
  },
  {
    id: "3",
    name: "OneDrive Sync",
    type: "Microsoft OneDrive",
    status: "Active",
    exportFormat: "CSV",
    schedule: "Daily",
    lastExport: "2024-07-11T09:15:00Z"
  }
];

const Destinations = () => {
  const [destinations, setDestinations] = useState(initialDestinations);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  const handleTestConnection = (id: string) => {
    toast({
      title: "Testing connection...",
      description: "Checking connection to destination.",
    });
    
    // Simulate API delay
    setTimeout(() => {
      toast({
        title: "Connection successful",
        description: "The destination connection is working properly.",
      });
    }, 1500);
  };

  const handleDelete = (id: string) => {
    // Simulate deletion
    setDestinations(destinations.filter(dest => dest.id !== id));
    
    toast({
      title: "Destination deleted",
      description: "The destination has been removed successfully.",
    });
  };

  const handleAddDestination = (newDestination: any) => {
    // Add new destination with a random ID
    setDestinations([
      ...destinations, 
      { ...newDestination, id: Math.random().toString(36).substring(2, 9) }
    ]);
    
    toast({
      title: "Destination added",
      description: `${newDestination.name} has been added successfully.`,
    });
    
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <DestinationsInfoBanner />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">My Destinations</h1>
        <Button className="flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add New Destination
        </Button>
      </div>

      {destinations.length === 0 ? (
        <EmptyStateCard
          icon={Database}
          title="No destinations configured"
          description="Add your first destination to start exporting processed data to external systems or storage providers."
          actionLabel="Add Destination"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              onTestConnection={handleTestConnection}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <AddDestinationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddDestination}
      />
    </div>
  );
};

export default Destinations;
