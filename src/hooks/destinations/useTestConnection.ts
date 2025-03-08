
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { testConnection } from "./destinationApi";
import { Destination } from "./types";

export const useTestConnection = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: testConnection,
    onSuccess: (data) => {
      toast({
        title: "Connection test successful",
        description: data.message || "The destination connection is working properly.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection test failed",
        description: error.message || "Failed to connect to destination.",
        variant: "destructive",
      });
    },
  });
};
