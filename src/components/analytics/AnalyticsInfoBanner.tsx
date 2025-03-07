
import React from "react";
import InfoBanner from "@/components/InfoBanner";

const AnalyticsInfoBanner: React.FC = () => {
  return (
    <InfoBanner
      messageId="analytics-info" 
      message={
        <span>
          <span className="font-bold">⚡ The Analytics</span> page provides insights and visualizations on your data flow, transformation performance, and integration efficiency, helping you make data-driven decisions.
        </span>
      }
    />
  );
};

export default AnalyticsInfoBanner;
