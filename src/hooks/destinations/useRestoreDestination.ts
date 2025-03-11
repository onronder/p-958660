
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { restoreDestination } from "./api";

export const useRestoreDestination = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreDestination,
    onSuccess: (restoredDestination) => {
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      toast({
        title: "Destination restored",
        description: `${restoredDestination.name || "The destination"} has been successfully restored.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to restore destination.",
        variant: "destructive",
      });
    },
  });
};
