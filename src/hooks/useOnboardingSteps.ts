
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface OnboardingStep {
  id: string;
  step_order: number;
  title: string;
  description: string;
  element_selector: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  created_at: string;
}

export const useOnboardingSteps = () => {
  const { toast } = useToast();

  const {
    data: stepsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["onboardingSteps"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke("onboarding-steps", {
          method: "GET"
        });

        if (error) throw error;
        return data.steps || [];
      } catch (error) {
        console.error("Error fetching onboarding steps:", error);
        toast({
          title: "Error fetching onboarding steps",
          description: "Please try again later.",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  return {
    steps: stepsData as OnboardingStep[] || [],
    isLoading,
    error,
  };
};
