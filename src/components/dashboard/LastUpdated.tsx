
import React from "react";

interface LastUpdatedProps {
  timestamp: string | null;
}

const LastUpdated: React.FC<LastUpdatedProps> = ({ timestamp }) => {
  if (!timestamp) return null;
  
  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="text-xs text-right text-gray-500">
      Last updated: {formatLastUpdated(timestamp)}
    </div>
  );
};

export default LastUpdated;
