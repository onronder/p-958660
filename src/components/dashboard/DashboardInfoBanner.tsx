
import React from "react";
import { InfoIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

const DashboardInfoBanner: React.FC = () => {
  return (
    <Card className="bg-blue-50 border-blue-200 p-4 flex items-start space-x-4 mb-6">
      <div className="text-blue-500 mt-1 flex-shrink-0">
        <InfoIcon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-blue-800 leading-relaxed">
          <span className="font-bold">⚡ The Dashboard</span> provides a centralized view of your data integration processes, offering key performance metrics, recent activity, and insights to help you monitor and manage your workflows effectively.
        </p>
      </div>
    </Card>
  );
};

export default DashboardInfoBanner;
