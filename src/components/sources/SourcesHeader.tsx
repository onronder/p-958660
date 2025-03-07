
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface SourcesHeaderProps {
  onRefresh: () => void;
  onAddSource: () => void;
}

const SourcesHeader: React.FC<SourcesHeaderProps> = ({ 
  onRefresh, 
  onAddSource 
}) => {
  const { toast } = useToast();

  const handleHelpClick = () => {
    toast({
      title: "Sources Help",
      description: "FlowTechs connects to platforms like Shopify, WooCommerce, and databases.",
    });
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold text-primary">My Sources</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={handleHelpClick}
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Learn about connecting data sources</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={onRefresh} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        
        <Button onClick={onAddSource} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Source
        </Button>
      </div>
    </div>
  );
};

export default SourcesHeader;
