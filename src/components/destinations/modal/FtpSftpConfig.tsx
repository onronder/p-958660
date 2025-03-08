
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FtpSftpConfigProps {
  updateCredential: (field: string, value: string) => void;
}

const FtpSftpConfig: React.FC<FtpSftpConfigProps> = ({ updateCredential }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="host">Host</Label>
        <Input 
          id="host" 
          placeholder="ftp.example.com" 
          onChange={(e) => updateCredential("host", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input 
            id="username" 
            placeholder="username" 
            onChange={(e) => updateCredential("username", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            onChange={(e) => updateCredential("password", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="port">Port</Label>
          <Input 
            id="port" 
            placeholder="21" 
            onChange={(e) => updateCredential("port", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="path">Directory Path</Label>
          <Input 
            id="path" 
            placeholder="/backups" 
            onChange={(e) => updateCredential("path", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default FtpSftpConfig;
