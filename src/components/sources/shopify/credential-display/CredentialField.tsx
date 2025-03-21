
import React from "react";

interface CredentialFieldProps {
  label: string;
  value: string | null | undefined;
  isSensitive?: boolean;
}

const CredentialField: React.FC<CredentialFieldProps> = ({ 
  label, 
  value, 
  isSensitive = true 
}) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {label}
      </h3>
      <p className="font-mono text-sm">
        {value 
          ? (isSensitive ? "●●●●●●●●●●●●●●●●" : value) 
          : "Not provided"}
      </p>
    </div>
  );
};

export default CredentialField;
