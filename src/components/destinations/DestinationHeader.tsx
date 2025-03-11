
import React from "react";
import StatusBadge from "./StatusBadge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DestinationHeaderProps {
  name: string;
  destinationType: string;
  status: "Active" | "Pending" | "Failed" | "Deleted";
}

const DestinationHeader: React.FC<DestinationHeaderProps> = ({ 
  name, 
  destinationType, 
  status 
}) => {
  // Truncate the name if it's too long (more than 25 characters)
  const displayName = name.length > 25 ? `${name.substring(0, 22)}...` : name;
  const needsTooltip = name.length > 25;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {needsTooltip ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="text-lg font-semibold truncate max-w-[200px]">{displayName}</h3>
              </TooltipTrigger>
              <TooltipContent>
                <p>{name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <h3 className="text-lg font-semibold truncate max-w-[200px]">{displayName}</h3>
        )}
        <StatusBadge status={status} />
      </div>
      <p className="text-sm text-muted-foreground">{destinationType}</p>
    </div>
  );
};

export default DestinationHeader;
