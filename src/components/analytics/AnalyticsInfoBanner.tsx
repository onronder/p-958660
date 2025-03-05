
import React from "react";

const AnalyticsInfoBanner: React.FC = () => {
  return (
    <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-4 mb-4">
      <div className="text-blue-500 mt-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-blue-800">
          <span className="font-bold">⚡ The Analytics</span> page provides insights and visualizations on your data flow, transformation performance, and integration efficiency, helping you make data-driven decisions.
        </p>
      </div>
    </div>
  );
};

export default AnalyticsInfoBanner;
