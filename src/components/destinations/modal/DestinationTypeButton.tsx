
import React from "react";

interface DestinationTypeButtonProps {
  type: string;
  selected: boolean;
  onClick: () => void;
}

const DestinationTypeButton: React.FC<DestinationTypeButtonProps> = ({ 
  type, 
  selected, 
  onClick 
}) => {
  return (
    <div 
      className={`
        p-4 border rounded-md text-center cursor-pointer transition-all
        ${selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
      `}
      onClick={onClick}
    >
      <p className="font-medium">{type}</p>
    </div>
  );
};

export default DestinationTypeButton;
