
import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ConnectionStatusProps {
  connectionTestResult: {
    success: boolean;
    message: string;
  };
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ connectionTestResult }) => {
  return (
    <div className={`p-4 border rounded-md ${connectionTestResult.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
      <div className="flex items-start">
        {connectionTestResult.success ? (
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
        ) : (
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
        )}
        <div>
          <p className="font-medium">{connectionTestResult.success ? 'Connection Successful' : 'Connection Failed'}</p>
          <p className="mt-1">{connectionTestResult.message}</p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;
