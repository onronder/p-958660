
import React from "react";
import { InfoIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import InfoBanner from "@/components/InfoBanner";

const DestinationsInfoBanner: React.FC = () => {
  return (
    <InfoBanner 
      messageId="destinations-info"
      message={
        <span>
          <span className="font-bold">⚡ The My Destinations</span> page allows you to configure and manage where processed data will be sent, ensuring seamless integration with target systems or platforms.
        </span>
      }
    />
  );
};

export default DestinationsInfoBanner;
