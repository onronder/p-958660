
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Transformation } from "@/types/transformation";
import { supabase } from "@/integrations/supabase/client";

export const useLoadTransformations = (
  setTransformations: React.Dispatch<React.SetStateAction<Transformation[]>>,
  setIsLoading: (isLoading: boolean) => void
) => {
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadTransformations();
    }
  }, [user]);

  const loadTransformations = async () => {
    try {
      setIsLoading(true);
      
      if (!user) {
        return;
      }
      
      const { data, error } = await supabase.functions.invoke("get-transformations", {
        method: "GET"
      });
      
      if (error) throw error;

      setTransformations(data.transformations || []);
    } catch (error) {
      console.error("Error fetching transformations:", error);
      toast({
        title: "Error",
        description: "Failed to load transformations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { loadTransformations };
};
