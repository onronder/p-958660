
import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface HelpQuickSupportProps {
  onStartTour: () => void;
}

const HelpQuickSupport = ({ onStartTour }: HelpQuickSupportProps) => {
  const [showTourButton, setShowTourButton] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleStartTour = async () => {
    // Reset onboarding_completed to false to trigger the tour
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ onboarding_completed: false })
          .eq('id', user.id);

        if (error) throw error;

        toast({
          title: "Onboarding Tour Activated",
          description: "Navigate to the dashboard to start the tour.",
        });

        setShowTourButton(false);
        onStartTour();
      } catch (error) {
        console.error("Failed to activate tour:", error);
        toast({
          title: "Error",
          description: "Failed to activate the tour. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the guided tour feature.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <HelpCircle className="w-5 h-5 mr-2 text-primary" />
          Need More Help?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Can't find what you're looking for? Get in touch with our support team.
        </p>
        <Button variant="outline" className="w-full">
          Contact Support
        </Button>
        {showTourButton && (
          <Button 
            variant="link" 
            className="w-full mt-2 text-primary"
            onClick={handleStartTour}
          >
            Start Guided Tour
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default HelpQuickSupport;
