
import React from "react";
import { InfoIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import InfoBanner from "@/components/InfoBanner";

const DashboardInfoBanner: React.FC = () => {
  return (
    <InfoBanner 
      messageId="dashboard-info"
      message={
        <span>
          <span className="font-bold">⚡ The Dashboard</span> provides a centralized view of your data integration processes, offering key performance metrics, recent activity, and insights to help you monitor and manage your workflows effectively.
        </span>
      }
    />
  );
};

export default DashboardInfoBanner;
