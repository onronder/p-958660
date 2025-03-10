
import React from "react";

interface DestinationTypeButtonProps {
  type: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const DestinationTypeButton: React.FC<DestinationTypeButtonProps> = ({ 
  type, 
  selected, 
  onClick,
  disabled = false
}) => {
  return (
    <div 
      className={`
        p-4 border rounded-md text-center transition-all
        ${selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={disabled ? undefined : onClick}
    >
      <p className="font-medium">{type}</p>
    </div>
  );
};

export default DestinationTypeButton;
