
import React from "react";
import { InfoIcon } from "lucide-react";
import DismissButton from "./info/DismissButton";
import { useInfoBanner } from "@/hooks/useInfoBanner";

export interface InfoBannerProps {
  message: React.ReactNode;
  messageId: string;
  onDismiss?: () => void;
}

const InfoBanner: React.FC<InfoBannerProps> = ({ 
  message, 
  messageId, 
  onDismiss 
}) => {
  const { isVisible, dismissMessage } = useInfoBanner(messageId);

  const handleDismiss = () => {
    dismissMessage();
    if (onDismiss) onDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-4 mb-4 relative">
      <div className="text-blue-500 mt-1">
        <InfoIcon />
      </div>
      <div className="flex-1">
        <p className="text-blue-800">{message}</p>
      </div>
      <DismissButton onDismiss={handleDismiss} />
    </div>
  );
};

export default InfoBanner;
