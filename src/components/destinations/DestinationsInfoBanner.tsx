
import React from "react";
import InfoBanner from "@/components/InfoBanner";
import { useDismissibleHelp } from "@/hooks/useDismissibleHelp";

const DestinationsInfoBanner = () => {
  const { isMessageDismissed, dismissMessage, resetAllDismissedMessages, isResetting } = useDismissibleHelp();
  
  const infoContent = {
    title: "Destinations Management",
    description:
      "Destinations allow you to export your data to various storage services and platforms. Connect to cloud storage, databases, or custom APIs to streamline your data workflow.",
    learnMoreUrl: "/help/destinations",
    messageId: "destinations_info"
  };

  return (
    <InfoBanner
      {...infoContent}
      isDismissed={isMessageDismissed(infoContent.messageId)}
      onDismiss={() => dismissMessage(infoContent.messageId)}
    />
  );
};

export default DestinationsInfoBanner;
