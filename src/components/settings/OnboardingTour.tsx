
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface TourStep {
  element: string;
  title: string;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

const steps: TourStep[] = [
  {
    element: '.sources-menu-item',
    title: 'Connect Your Data Sources',
    content: 'Start by connecting to your data sources like e-commerce platforms, databases or files.',
    position: 'right',
  },
  {
    element: '.transform-menu-item',
    title: 'Transform Your Data',
    content: 'Create transformations to clean, format and prepare your data for analysis.',
    position: 'right',
  },
  {
    element: '.destinations-menu-item',
    title: 'Configure Destinations',
    content: 'Set up destinations to export your transformed data to various platforms.',
    position: 'right',
  },
  {
    element: '.jobs-menu-item',
    title: 'Create Automated Jobs',
    content: 'Schedule automated jobs to regularly process your data without manual intervention.',
    position: 'right',
  },
  {
    element: '.settings-menu-item',
    title: 'Customize Your Settings',
    content: 'Configure your account settings, API keys, and preferences.',
    position: 'right',
  },
];

interface OnboardingTourProps {
  onComplete?: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { profile, completeOnboarding } = useSettings();
  const { user } = useAuth();

  useEffect(() => {
    // Check if user has already completed onboarding
    if (profile?.onboarding_completed) {
      setIsVisible(false);
    }
  }, [profile]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    await completeOnboarding();
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  if (!isVisible || !user) {
    return null;
  }

  const currentTourStep = steps[currentStep];
  const targetElement = document.querySelector(currentTourStep.element);
  
  // Calculate position for tooltip
  let tooltipStyle = {};
  const position = currentTourStep.position || 'right';

  if (targetElement) {
    const rect = targetElement.getBoundingClientRect();
    
    switch (position) {
      case 'top':
        tooltipStyle = {
          bottom: `${window.innerHeight - rect.top + 10}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)',
        };
        break;
      case 'right':
        tooltipStyle = {
          left: `${rect.right + 10}px`,
          top: `${rect.top + rect.height / 2}px`,
          transform: 'translateY(-50%)',
        };
        break;
      case 'bottom':
        tooltipStyle = {
          top: `${rect.bottom + 10}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)',
        };
        break;
      case 'left':
        tooltipStyle = {
          right: `${window.innerWidth - rect.left + 10}px`,
          top: `${rect.top + rect.height / 2}px`,
          transform: 'translateY(-50%)',
        };
        break;
    }
    
    // Highlight the target element
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    targetElement.classList.add('onboarding-highlight');
    
    // Clean up highlight on component unmount or step change
    return () => {
      targetElement.classList.remove('onboarding-highlight');
    };
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 pointer-events-none"
      aria-hidden="true"
    >
      <div 
        className={cn(
          "absolute z-50 bg-card text-card-foreground p-4 rounded-lg shadow-lg w-72 pointer-events-auto",
          {
            'after:content-[""] after:absolute after:border-8 after:border-transparent': true,
            'after:border-r-card': position === 'left',
            'after:border-l-card': position === 'right',
            'after:border-b-card': position === 'top',
            'after:border-t-card': position === 'bottom',
            'after:-right-4 after:top-1/2 after:-translate-y-1/2': position === 'left',
            'after:-left-4 after:top-1/2 after:-translate-y-1/2': position === 'right',
            'after:left-1/2 after:-bottom-4 after:-translate-x-1/2': position === 'top',
            'after:left-1/2 after:-top-4 after:-translate-x-1/2': position === 'bottom',
          }
        )}
        style={tooltipStyle}
      >
        <button 
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          onClick={handleSkip}
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="text-lg font-semibold mb-2">{currentTourStep.title}</h3>
        <p className="text-sm mb-4">{currentTourStep.content}</p>
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {currentStep + 1} / {steps.length}
          </div>
          <div className="space-x-2">
            {currentStep > 0 && (
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                Previous
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
