
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { addDestination } from "./destinationApi";

export const useAddDestination = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAddDestination = async (newDestination: any) => {
    try {
      await addDestination(newDestination);
      
      toast({
        title: "Destination added",
        description: `${newDestination.name} has been added successfully.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      return true;
    } catch (error) {
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
