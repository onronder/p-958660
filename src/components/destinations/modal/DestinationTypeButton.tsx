
import React from "react";
import { Database, CloudCog, FolderGit2, FileJson, ServerCog } from "lucide-react";

interface DestinationTypeButtonProps {
  type: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  icon?: string;
  isComingSoon?: boolean;
}

const DestinationTypeButton: React.FC<DestinationTypeButtonProps> = ({ 
  type, 
  selected, 
  onClick,
  disabled = false,
  icon,
  isComingSoon = false
}) => {
  const renderIcon = () => {
    switch (icon) {
      case "drive":
        return <FolderGit2 className="h-5 w-5 mx-auto mb-2" />;
      case "onedrive":
        return <CloudCog className="h-5 w-5 mx-auto mb-2" />;
      case "aws":
        return <ServerCog className="h-5 w-5 mx-auto mb-2" />;
      case "api":
        return <FileJson className="h-5 w-5 mx-auto mb-2" />;
      case "ftp":
        return <Database className="h-5 w-5 mx-auto mb-2" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={`
        p-4 border rounded-md text-center transition-all relative
        ${selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={disabled ? undefined : onClick}
    >
      {renderIcon()}
      <p className="font-medium">{type}</p>
      
      {isComingSoon && (
        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
          Soon
        </div>
      )}
    </div>
  );
};

export default DestinationTypeButton;
