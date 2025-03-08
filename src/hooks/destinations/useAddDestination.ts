
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { addDestination } from "./destinationApi";

export const useAddDestination = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAddDestination = async (newDestination: any) => {
    try {
      console.log("Handling add destination:", newDestination);
      
      await addDestination(newDestination);
      
      toast({
        title: "Destination added",
        description: `${newDestination.name} has been added successfully.`,
      });
      
      // Invalidate and refetch destinations to show the new one
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      return true;
    } catch (error) {
      console.error("Error adding destination:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add destination",
        variant: "destructive",
      });
      return false;
    }
  };

  return { handleAddDestination };
};
