
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Transformation } from "@/types/transformation";

export const useTransformations = () => {
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTransformations = async () => {
      try {
        setIsLoading(true);
        
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          throw new Error("User not authenticated");
        }
        
        const { data, error } = await supabase
          .from('transformations')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setTransformations(data || []);
      } catch (err) {
        console.error("Error fetching transformations:", err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        toast({
          title: "Error",
          description: "Failed to load transformations",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransformations();
  }, [toast]);

  return { transformations, isLoading, error };
};
