
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const HelpFloatingButton = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button className="fixed bottom-4 right-4" size="icon">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Need help? Click here for a guided tour</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HelpFloatingButton;
