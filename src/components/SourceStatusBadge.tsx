
import React from "react";

interface SourceStatusBadgeProps {
  status: "Active" | "Inactive" | "Pending" | "Failed";
}

const SourceStatusBadge: React.FC<SourceStatusBadgeProps> = ({ status }) => {
  let classes = "px-2 py-1 rounded-full text-xs font-medium ";
  
  switch (status) {
    case "Active":
      classes += "bg-green-100 text-green-800";
      break;
    case "Inactive":
      classes += "bg-gray-100 text-gray-800";
      break;
    case "Pending":
      classes += "bg-yellow-100 text-yellow-800";
      break;
    case "Failed":
      classes += "bg-red-100 text-red-800";
      break;
  }
  
  return <span className={classes}>{status}</span>;
};

export default SourceStatusBadge;
