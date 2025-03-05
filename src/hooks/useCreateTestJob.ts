
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export const useCreateTestJob = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createTestJob = async (
    sourceName: string = "Test Source",
    jobType: "Orders" | "Products" | "Customers" = "Orders",
    status: "Success" | "Failed" | "Running" | "Pending" = "Success"
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create jobs",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);

      // Random duration between 1 and 15 minutes (in milliseconds)
      const durationMs = Math.floor(Math.random() * 14 * 60 * 1000) + 60 * 1000;
      
      // Convert to interval string format HH:MM:SS
      const hours = Math.floor(durationMs / 3600000);
      const minutes = Math.floor((durationMs % 3600000) / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      const durationStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      // Random number of rows processed, between 100 and 10,000
      const rowsProcessed = Math.floor(Math.random() * 9900) + 100;

      const { data, error } = await supabase.from("jobs").insert([
        {
          user_id: user.id,
          source_name: sourceName,
          job_type: jobType,
          duration: durationStr,
          rows_processed: rowsProcessed,
          status: status
        }
      ]);

      if (error) {
        throw error;
      }

      toast({
        title: "Job Created",
        description: `Successfully created a test job: ${jobType} from ${sourceName}`,
      });

      return data;
    } catch (error) {
      console.error("Error creating test job:", error);
      toast({
        title: "Error",
        description: "Failed to create test job. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createTestJob,
    isCreating,
  };
};
