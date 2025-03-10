
import React from "react";
import { JobStatus } from "@/types/job";
import { Badge } from "@/components/ui/badge";

interface JobStatusBadgeProps {
  status: JobStatus;
}

const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ status }) => {
  let variant = "default";
  
  switch (status) {
    case "active":
      variant = "success";
      break;
    case "paused":
      variant = "warning";
      break;
    case "completed":
      variant = "accent";
      break;
    case "failed":
      variant = "destructive";
      break;
    default:
      variant = "default";
  }
  
  // Capitalize first letter for display
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
  
  return <Badge variant={variant as any} className="animate-fade-in">{displayStatus}</Badge>;
};

export default JobStatusBadge;
