
import { useQueryClient } from "@tanstack/react-query";
import { updateDestination } from "./api";

export const useUpdateDestination = () => {
  const queryClient = useQueryClient();

  // Update destination
  const handleUpdateDestination = async (destination: any) => {
    try {
      const updatedDestination = await updateDestination(destination);
      await queryClient.invalidateQueries({ queryKey: ["destinations"] });
      return true;
    } catch (error) {
      console.error("Error updating destination:", error);
      return false;
    }
  };

  return { handleUpdateDestination };
};
