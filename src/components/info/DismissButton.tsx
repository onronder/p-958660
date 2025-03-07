
import React from "react";
import { X } from "lucide-react";

interface DismissButtonProps {
  onDismiss: () => void;
}

const DismissButton: React.FC<DismissButtonProps> = ({ onDismiss }) => {
  return (
    <button 
      onClick={onDismiss} 
      className="text-blue-400 hover:text-blue-600 transition-colors absolute top-2 right-2"
      aria-label="Dismiss"
    >
      <X size={18} />
    </button>
  );
};

export default DismissButton;
