
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface OnboardingTourProps {
  onClose: () => void;
}

const OnboardingTour = ({ onClose }: OnboardingTourProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Welcome to FlowTechs",
      description: "Let's take a quick tour of the key features to help you get started.",
      image: "https://placehold.co/600x400/png",
    },
    {
      title: "Connect Your Data Sources",
      description: "Start by connecting your data sources from the Sources page. We support multiple platforms including Shopify, WooCommerce and more.",
      image: "https://placehold.co/600x400/png",
      targetSelector: ".sources",
    },
    {
      title: "Transform Your Data",
      description: "Use the Load & Transform page to clean, enrich, and prepare your data for analysis.",
      image: "https://placehold.co/600x400/png",
      targetSelector: ".transform",
    },
    {
      title: "Set Up Destinations",
      description: "Configure where your transformed data should be exported using the My Destinations page.",
      image: "https://placehold.co/600x400/png",
      targetSelector: ".destinations",
    },
    {
      title: "Automate with Jobs",
      description: "Schedule recurring jobs to automate your data pipeline from the Jobs page.",
      image: "https://placehold.co/600x400/png",
      targetSelector: ".jobs",
    },
    {
      title: "You're All Set!",
      description: "You now know the basics of FlowTechs. Explore the platform and reach out if you need any help.",
      image: "https://placehold.co/600x400/png",
    },
  ];
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const completeTour = () => {
    // Update user preferences in database
    // This would typically be implemented with a Supabase call
    
    toast({
      title: "Tour completed",
      description: "You've completed the onboarding tour. You can restart it anytime from Settings.",
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl mx-4 overflow-hidden">
        <div className="relative">
          <button 
            className="absolute top-4 right-4 p-1 rounded-full bg-muted hover:bg-muted/80 z-10"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="aspect-video bg-muted relative">
            <img 
              src={steps[currentStep].image} 
              alt={steps[currentStep].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-2 text-white">
                <span className="font-medium">Step {currentStep + 1} of {steps.length}</span>
                <div className="flex-grow h-1 bg-white/20 rounded-full">
                  <div 
                    className="h-full bg-white rounded-full"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{steps[currentStep].title}</h3>
            <p className="text-muted-foreground mb-6">{steps[currentStep].description}</p>
            
            <div className="flex justify-between items-center">
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Skip Tour
                </Button>
              </div>
              
              <Button onClick={nextStep}>
                {currentStep < steps.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Complete
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OnboardingTour;
