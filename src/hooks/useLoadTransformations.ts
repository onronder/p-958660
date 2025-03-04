
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Transformation } from "@/types/transformation";

export const useLoadTransformations = (
  setTransformations: (transformations: Transformation[]) => void,
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
      
      // In a real implementation, we would fetch from the database
      // const { data, error } = await supabase
      //   .from('transformations')
      //   .select('*')
      //   .eq('user_id', user.id);
      
      // if (error) throw error;
      
      // For now, we'll use mock data extending the existing sample
      const mockTransformations: Transformation[] = [
        {
          id: "1",
          name: "Order Transformation",
          source_id: "shopify-source",
          source_name: "Orders",
          status: "Active",
          last_modified: "2023-11-22",
          user_id: user.id
        },
        {
          id: "2",
          name: "Customer Insights",
          source_id: "customers-source",
          source_name: "Customers",
          status: "Inactive",
          last_modified: "2023-11-20",
          user_id: user.id
        },
        {
          id: "3",
          name: "Tax Calculation",
          source_id: "shopify-source",
          source_name: "Orders",
          status: "Active",
          last_modified: "2023-12-05",
          expression: "total_price * 1.2",
          user_id: user.id
        }
      ];
      
      setTransformations(mockTransformations);
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
