
import React from "react";
import { JobStatus } from "@/types/job";
import { Badge } from "@/components/ui/badge";

interface JobStatusBadgeProps {
  status: JobStatus;
}

const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ status }) => {
  let variant = "default";
  
  switch (status) {
    case "Active":
      variant = "success";
      break;
    case "Paused":
      variant = "warning";
      break;
    case "Completed":
      variant = "accent";
      break;
    case "Failed":
      variant = "destructive";
      break;
    default:
      variant = "default";
  }
  
  return <Badge variant={variant as any} className="animate-fade-in">{status}</Badge>;
};

export default JobStatusBadge;
