
import React from "react";
import InfoBanner from "@/components/InfoBanner";
import { useInfoBanner } from "@/hooks/useInfoBanner";

const DestinationsInfoBanner: React.FC = () => {
  const { isVisible: showBanner, dismissMessage } = useInfoBanner("destinations-info");
  
  if (!showBanner) return null;
  
  return (
    <InfoBanner
      messageId="destinations-info"
      title="About Destinations"
      description="Destinations allow you to automatically export your processed data to various storage services, APIs, or servers."
      learnMoreUrl="/help/destinations"
      isDismissed={!showBanner}
      onDismiss={async () => {
        dismissMessage();
        return true;
      }}
    />
  );
};

export default DestinationsInfoBanner;
