
import React from "react";
import { JobStatus } from "@/types/job";

interface JobStatusBadgeProps {
  status: JobStatus;
}

const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ status }) => {
  let classes = "px-2 py-1 rounded-full text-xs font-medium ";
  
  switch (status) {
    case "Active":
      classes += "bg-green-100 text-green-800";
      break;
    case "Paused":
      classes += "bg-yellow-100 text-yellow-800";
      break;
    case "Completed":
      classes += "bg-blue-100 text-blue-800";
      break;
    case "Failed":
      classes += "bg-red-100 text-red-800";
      break;
  }
  
  return <span className={classes}>{status}</span>;
};

export default JobStatusBadge;
