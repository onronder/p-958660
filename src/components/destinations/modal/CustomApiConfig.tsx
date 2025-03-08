
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomApiConfigProps {
  updateCredential: (field: string, value: string) => void;
}

const CustomApiConfig: React.FC<CustomApiConfigProps> = ({ updateCredential }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="base_url">Base URL</Label>
        <Input 
          id="base_url" 
          placeholder="https://api.example.com" 
          onChange={(e) => updateCredential("baseUrl", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="auth_type">Authentication Type</Label>
        <Select onValueChange={(value) => updateCredential("authType", value)}>
          <SelectTrigger id="auth_type">
            <SelectValue placeholder="Select auth type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="bearer">Bearer Token</SelectItem>
            <SelectItem value="basic">Basic Auth</SelectItem>
            <SelectItem value="api_key">API Key</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="token">Authentication Token/Key</Label>
        <Input 
          id="token" 
          type="password" 
          placeholder="••••••••" 
          onChange={(e) => updateCredential("token", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="headers">Additional Headers (JSON)</Label>
        <Input 
          id="headers" 
          placeholder='{"Content-Type": "application/json"}' 
          onChange={(e) => updateCredential("headers", e.target.value)}
        />
      </div>
    </div>
  );
};

export default CustomApiConfig;
