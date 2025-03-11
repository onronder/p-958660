
import React from "react";
import { InfoIcon } from "lucide-react";
import DismissButton from "./info/DismissButton";
import { useInfoBanner } from "@/hooks/useInfoBanner";

export interface InfoBannerProps {
  title?: string;
  description?: string;
  message?: React.ReactNode;
  messageId: string;
  learnMoreUrl?: string;
  isDismissed?: boolean;
  onDismiss?: () => void;
}

const InfoBanner: React.FC<InfoBannerProps> = ({ 
  title,
  description,
  message, 
  messageId, 
  learnMoreUrl,
  isDismissed,
  onDismiss 
}) => {
  const { isVisible, dismissMessage } = useInfoBanner(messageId);

  // If the component is explicitly marked as dismissed through props
  if (isDismissed) return null;
  
  const handleDismiss = () => {
    dismissMessage();
    if (onDismiss) onDismiss();
  };

  if (!isVisible) return null;

  // Construct the message from title/description if no direct message is provided
  const displayMessage = message || (
    <>
      {title && <h4 className="font-medium text-blue-800 mb-1">{title}</h4>}
      {description && <p className="text-blue-800">{description}</p>}
      {learnMoreUrl && (
        <a href={learnMoreUrl} className="text-blue-600 hover:text-blue-800 underline text-sm mt-1 inline-block">
          Learn more
        </a>
      )}
    </>
  );

  return (
    <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-4 mb-4 relative">
      <div className="text-blue-500 mt-1">
        <InfoIcon />
      </div>
      <div className="flex-1">
        {displayMessage}
      </div>
      <DismissButton onDismiss={handleDismiss} />
    </div>
  );
};

export default InfoBanner;
