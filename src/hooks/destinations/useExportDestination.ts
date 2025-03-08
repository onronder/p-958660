
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { exportToDestination } from "./destinationApi";

export const useExportDestination = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: exportToDestination,
    onSuccess: () => {
      toast({
        title: "Export started",
        description: "The export process has been started. You'll be notified when it completes.",
      });
      // Refetch after a few seconds to see status update
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["destinations"] }), 5000);
    },
    onError: (error: Error) => {
      toast({
        title: "Export failed",
        description: error.message || "Failed to start export process.",
        variant: "destructive",
      });
    },
  });
};
