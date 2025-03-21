
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTestConnection } from "@/hooks/destinations/useTestConnection";
import { Destination } from "@/hooks/destinations/types";

interface FtpSftpConfigProps {
  updateCredential: (field: string, value: any) => void;
  credentials: Record<string, any>;
  name: string; // Required name property
}

const FtpSftpConfig: React.FC<FtpSftpConfigProps> = ({ 
  updateCredential, 
  credentials,
  name 
}) => {
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "failed">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const testConnection = useTestConnection();
  
  const handleTestConnection = async () => {
    if (!credentials.host || !credentials.port || !credentials.username) {
      setErrorMessage("Please fill in all required fields first");
      setConnectionStatus("failed");
      return;
    }
    
    setConnectionStatus("testing");
    setErrorMessage(null);
    
    try {
      // Create a destination object that matches the required Destination type
      const testDestination: Destination = {
        id: "temp-test-id", // Temporary ID for testing
        name: name || "Test Connection",
        destination_type: "FTP/SFTP",
        storage_type: credentials.protocol || "ftp_sftp",
        status: "Pending",
        export_format: "CSV",
        schedule: "Manual",
        last_export: null,
        config: {
          host: credentials.host,
          port: Number(credentials.port),
          username: credentials.username,
          password: credentials.password || "",
          protocol: credentials.protocol || "ftp"
        }
      };
      
      const result = await testConnection.mutateAsync(testDestination);
      
      if (result.success) {
        setConnectionStatus("success");
      } else {
        setConnectionStatus("failed");
        setErrorMessage(result.message || "Failed to connect to server");
      }
    } catch (error) {
      setConnectionStatus("failed");
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
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
        <Label htmlFor="protocol">Protocol <span className="text-red-500">*</span></Label>
        <select
          id="protocol"
          className="w-full p-2 border border-gray-300 rounded"
          value={credentials.protocol || "ftp"}
          onChange={(e) => updateCredential("protocol", e.target.value)}
        >
          <option value="ftp">FTP</option>
          <option value="sftp">SFTP</option>
        </select>
      </div>
      
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
          placeholder={credentials.protocol === "sftp" ? "22" : "21"}
          value={credentials.port || (credentials.protocol === "sftp" ? "22" : "21")}
          onChange={(e) => updateCredential("port", e.target.value)}
          type="number"
        />
        <p className="text-xs text-gray-500">
          Default: {credentials.protocol === "sftp" ? "22 for SFTP" : "21 for FTP"}
        </p>
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
