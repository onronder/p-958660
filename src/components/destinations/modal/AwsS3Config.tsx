
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AwsS3ConfigProps {
  updateCredential: (field: string, value: string) => void;
}

const AwsS3Config: React.FC<AwsS3ConfigProps> = ({ updateCredential }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="access_key">Access Key</Label>
        <Input 
          id="access_key" 
          placeholder="AKIAIOSFODNN7EXAMPLE" 
          onChange={(e) => updateCredential("accessKey", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="secret_key">Secret Key</Label>
        <Input 
          id="secret_key" 
          type="password" 
          placeholder="••••••••" 
          onChange={(e) => updateCredential("secretKey", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bucket">Bucket Name</Label>
          <Input 
            id="bucket" 
            placeholder="my-bucket" 
            onChange={(e) => updateCredential("bucket", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Select onValueChange={(value) => updateCredential("region", value)}>
            <SelectTrigger id="region">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
              <SelectItem value="us-west-1">US West (N. California)</SelectItem>
              <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
              <SelectItem value="ap-northeast-1">Asia Pacific (Tokyo)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default AwsS3Config;
