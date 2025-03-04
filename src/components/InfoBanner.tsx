
import React from "react";
import { InfoIcon } from "lucide-react";

interface InfoBannerProps {
  message: React.ReactNode;
}

const InfoBanner: React.FC<InfoBannerProps> = ({ message }) => {
  return (
    <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-4 mb-4">
      <div className="text-blue-500 mt-1">
        <InfoIcon />
      </div>
      <div className="flex-1">
        <p className="text-blue-800">{message}</p>
      </div>
    </div>
  );
};

export default InfoBanner;
