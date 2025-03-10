
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Server, Key, Lock, Database, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FtpSftpConfigProps {
  updateCredential: (field: string, value: string | boolean | number) => void;
  credentials: Record<string, any>;
}

const FtpSftpConfig: React.FC<FtpSftpConfigProps> = ({ updateCredential, credentials }) => {
  const [protocolType, setProtocolType] = useState<string>(credentials.protocol || "ftp");
  
  const handleProtocolChange = (value: string) => {
    setProtocolType(value);
    updateCredential("protocol", value);
    
    // Update default port based on protocol
    if (value === "ftp" && (!credentials.port || credentials.port === 22)) {
      updateCredential("port", 21);
    } else if (value === "sftp" && (!credentials.port || credentials.port === 21)) {
      updateCredential("port", 22);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={protocolType} onValueChange={handleProtocolChange} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="ftp">FTP</TabsTrigger>
          <TabsTrigger value="sftp">SFTP (Secure)</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Server className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="host">Server Host</Label>
        </div>
        <Input 
          id="host" 
          placeholder="ftp.example.com" 
          value={credentials.host || ''}
          onChange={(e) => updateCredential("host", e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Key className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="username">Username</Label>
          </div>
          <Input 
            id="username" 
            placeholder="username" 
            value={credentials.username || ''}
            onChange={(e) => updateCredential("username", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="password">Password</Label>
          </div>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            value={credentials.password || ''}
            onChange={(e) => updateCredential("password", e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="port">Port</Label>
          </div>
          <Input 
            id="port" 
            placeholder={protocolType === "sftp" ? "22" : "21"} 
            value={credentials.port || (protocolType === "sftp" ? 22 : 21)}
            onChange={(e) => updateCredential("port", parseInt(e.target.value) || (protocolType === "sftp" ? 22 : 21))}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="path">Directory Path</Label>
          </div>
          <Input 
            id="path" 
            placeholder="/exports" 
            value={credentials.path || ''}
            onChange={(e) => updateCredential("path", e.target.value)}
          />
        </div>
      </div>
      
      {protocolType === "sftp" && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="use_key_auth" 
                      checked={credentials.useKeyAuth || false}
                      onCheckedChange={(checked) => updateCredential("useKeyAuth", checked)}
                    />
                    <Label htmlFor="use_key_auth" className="cursor-pointer">Use Key Authentication</Label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Use SSH key instead of password authentication</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {credentials.useKeyAuth && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="private_key">Private Key</Label>
              <Input 
                id="private_key" 
                placeholder="Paste your private key here"
                value={credentials.privateKey || ''}
                onChange={(e) => updateCredential("privateKey", e.target.value)}
              />
              
              <div className="pt-2">
                <Label htmlFor="passphrase">Key Passphrase (if applicable)</Label>
                <Input 
                  id="passphrase" 
                  type="password"
                  placeholder="Optional passphrase" 
                  value={credentials.passphrase || ''}
                  onChange={(e) => updateCredential("passphrase", e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="pt-2">
        <Button 
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            // This will be implemented when we address the test connection functionality
            console.log("Test connection with credentials:", credentials);
          }}
        >
          Test Connection
        </Button>
      </div>
    </div>
  );
};

export default FtpSftpConfig;
