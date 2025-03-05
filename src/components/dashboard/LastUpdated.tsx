
import React from "react";
import { ClockIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LastUpdatedProps {
  timestamp: string | null;
}

const LastUpdated: React.FC<LastUpdatedProps> = ({ timestamp }) => {
  if (!timestamp) return null;
  
  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - updated.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-end text-xs text-gray-500 mt-4 space-x-1 cursor-help">
            <ClockIcon className="h-3 w-3" />
            <span>Updated {formatRelativeTime(timestamp)}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Last updated: {formatLastUpdated(timestamp)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LastUpdated;
