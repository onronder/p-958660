
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { deleteDestination } from "./destinationApi";

export const useDeleteDestination = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDestination,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      toast({
        title: "Destination deleted",
        description: "The destination has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete destination.",
        variant: "destructive",
      });
    },
  });
};
