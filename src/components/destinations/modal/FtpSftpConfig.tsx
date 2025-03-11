
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useTestConnection } from "@/hooks/destinations/useTestConnection";

interface FtpSftpConfigProps {
  updateCredential: (field: string, value: any) => void;
  credentials: Record<string, any>;
  name: string;
}

const FtpSftpConfig: React.FC<FtpSftpConfigProps> = ({
  updateCredential,
  credentials,
  name,
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const testConnectionMutation = useTestConnection();

  const handleTestConnection = async () => {
    if (!credentials.host || !credentials.username || !credentials.password) {
      return;
    }

    setIsTesting(true);
    
    // Use the correct port value (default to 21 for FTP, 22 for SFTP)
    const port = credentials.port 
      ? Number(credentials.port) 
      : (credentials.protocol === 'sftp' ? 22 : 21);
    
    try {
      await testConnectionMutation.mutateAsync({
        id: "test",
        name: name,
        destination_type: "FTP/SFTP",
        storage_type: credentials.protocol || "ftp",
        status: "Pending",
        export_format: "CSV",
        schedule: "Manual",
        last_export: null,
        config: {
          ...credentials,
          port
        }
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Connection Type</Label>
        <RadioGroup 
          value={credentials.protocol || "ftp"} 
          onValueChange={(value) => updateCredential("protocol", value)}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ftp" id="ftp" />
            <Label htmlFor="ftp">FTP</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sftp" id="sftp" />
            <Label htmlFor="sftp">SFTP</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="host">Host</Label>
        <Input
          id="host"
          value={credentials.host || ""}
          onChange={(e) => updateCredential("host", e.target.value)}
          placeholder="ftp.example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="port">Port</Label>
        <Input
          id="port"
          value={credentials.port || (credentials.protocol === "sftp" ? "22" : "21")}
          onChange={(e) => updateCredential("port", e.target.value)}
          placeholder={credentials.protocol === "sftp" ? "22" : "21"}
          type="number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={credentials.username || ""}
          onChange={(e) => updateCredential("username", e.target.value)}
          placeholder="username"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={credentials.password || ""}
          onChange={(e) => updateCredential("password", e.target.value)}
          placeholder="password"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="directory">Directory (optional)</Label>
        <Input
          id="directory"
          value={credentials.directory || ""}
          onChange={(e) => updateCredential("directory", e.target.value)}
          placeholder="/path/to/directory"
        />
      </div>

      <Button 
        onClick={handleTestConnection} 
        disabled={isTesting || !credentials.host || !credentials.username || !credentials.password}
        type="button" 
        variant="outline" 
        className="w-full"
      >
        {isTesting ? "Testing Connection..." : "Test Connection"}
      </Button>
    </div>
  );
};

export default FtpSftpConfig;
