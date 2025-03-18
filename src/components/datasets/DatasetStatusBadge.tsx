
import React from "react";
import { Badge } from "@/components/ui/badge";

interface DatasetStatusBadgeProps {
  status: "pending" | "running" | "completed" | "failed";
}

const DatasetStatusBadge: React.FC<DatasetStatusBadgeProps> = ({ status }) => {
  let variant = "default";
  
  switch (status) {
    case "completed":
      variant = "success";
      break;
    case "running":
      variant = "warning";
      break;
    case "pending":
      variant = "secondary";
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

export default DatasetStatusBadge;
