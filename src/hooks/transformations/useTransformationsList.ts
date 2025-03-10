
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Transformation, TransformationStatus } from "@/types/transformation";

export const useTransformationsList = () => {
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

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
      
      // Cast the status to TransformationStatus when setting state
      const typedData = data?.map(item => ({
        ...item,
        status: item.status as TransformationStatus,
      })) as Transformation[] || [];
      
      setTransformations(typedData);
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

  useEffect(() => {
    fetchTransformations();
  }, [toast]);

  return { 
    transformations, 
    setTransformations,
    isLoading, 
    error,
    fetchTransformations
  };
};
