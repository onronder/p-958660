
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTestConnection } from "@/hooks/destinations/useTestConnection";

interface FtpSftpConfigProps {
  updateCredential: (field: string, value: any) => void;
  credentials: Record<string, any>;
  name: string; // Added required name property
}

const FtpSftpConfig: React.FC<FtpSftpConfigProps> = ({ 
  updateCredential, 
  credentials,
  name 
}) => {
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "failed">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { testConnectionMutation } = useTestConnection();
  
  const handleTestConnection = async () => {
    if (!credentials.host || !credentials.port || !credentials.username) {
      setErrorMessage("Please fill in all required fields first");
      setConnectionStatus("failed");
      return;
    }
    
    setConnectionStatus("testing");
    setErrorMessage(null);
    
    try {
      const result = await testConnectionMutation.mutateAsync({
        name: name || "Test Connection",
        destination_type: "FTP/SFTP",
        config: {
          host: credentials.host,
          port: Number(credentials.port),
          username: credentials.username,
          password: credentials.password || ""
        }
      });
      
      if (result.success) {
        setConnectionStatus("success");
      } else {
        setConnectionStatus("failed");
        setErrorMessage(result.message || "Failed to connect to server");
      }
    } catch (error) {
      setConnectionStatus("failed");
      setErrorMessage(error.message || "An unexpected error occurred");
    }
  };
  
  return (
    <div className="space-y-4">
      {connectionStatus === "success" && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Connection successful! Your credentials are working.
          </AlertDescription>
        </Alert>
      )}
      
      {connectionStatus === "failed" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage || "Failed to connect to the server. Please check your credentials."}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="host">Host <span className="text-red-500">*</span></Label>
        <Input 
          id="host" 
          placeholder="e.g., ftp.example.com" 
          value={credentials.host || ""}
          onChange={(e) => updateCredential("host", e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="port">Port <span className="text-red-500">*</span></Label>
        <Input 
          id="port" 
          placeholder="e.g., 21 for FTP, 22 for SFTP" 
          value={credentials.port || ""}
          onChange={(e) => updateCredential("port", e.target.value)}
          type="number"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
        <Input 
          id="username" 
          placeholder="Enter username" 
          value={credentials.username || ""}
          onChange={(e) => updateCredential("username", e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          placeholder="Enter password" 
          type="password"
          value={credentials.password || ""}
          onChange={(e) => updateCredential("password", e.target.value)}
        />
      </div>
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleTestConnection}
        disabled={connectionStatus === "testing"}
        className="mt-4"
      >
        {connectionStatus === "testing" ? "Testing..." : "Test Connection"}
      </Button>
    </div>
  );
};

export default FtpSftpConfig;
