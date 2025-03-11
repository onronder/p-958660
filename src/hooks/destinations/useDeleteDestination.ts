
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { deleteDestination, permanentlyDeleteDestination } from "./api";

export const useDeleteDestination = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string, permanent: boolean }) => {
      const { id, permanent } = params;
      return permanent 
        ? permanentlyDeleteDestination(id) 
        : deleteDestination(id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      toast({
        title: variables.permanent ? "Destination permanently deleted" : "Destination deleted",
        description: variables.permanent 
          ? "The destination has been permanently removed." 
          : "The destination has been moved to the deleted items.",
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
