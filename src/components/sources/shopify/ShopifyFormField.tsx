
import React from "react";
import { HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShopifyFormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  tooltip: string;
  type?: string;
}

const ShopifyFormField: React.FC<ShopifyFormFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  tooltip,
  type = "text",
}) => {
  const handleHelpClick = (e: React.MouseEvent) => {
    // Prevent event propagation to stop form validation
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5"
                onClick={handleHelpClick}  // Add click handler to prevent form validation
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="max-w-[250px] bg-white text-foreground border border-input shadow-md"
            >
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
};

export default ShopifyFormField;
