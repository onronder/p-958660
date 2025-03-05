
import React from "react";
import { InfoIcon } from "lucide-react";

const DashboardInfoBanner: React.FC = () => {
  return (
    <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-4 mb-4">
      <div className="text-blue-500 mt-1">
        <InfoIcon />
      </div>
      <div className="flex-1">
        <p className="text-blue-800">
          <span className="font-bold">⚡ The Dashboard</span> provides a centralized view of your data integration processes, offering key performance metrics, recent activity, and insights to help you monitor and manage your workflows effectively.
        </p>
      </div>
    </div>
  );
};

export default DashboardInfoBanner;
