
import React from "react";

interface JobStatusBadgeProps {
  status: "Success" | "Failed" | "Running" | "Pending";
}

const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ status }) => {
  let classes = "px-2 py-1 rounded-full text-xs font-medium ";
  
  switch (status) {
    case "Success":
      classes += "bg-green-100 text-green-800";
      break;
    case "Failed":
      classes += "bg-red-100 text-red-800";
      break;
    case "Running":
      classes += "bg-blue-100 text-blue-800";
      break;
    case "Pending":
      classes += "bg-yellow-100 text-yellow-800";
      break;
  }
  
  return <span className={classes}>{status}</span>;
};

export default JobStatusBadge;
