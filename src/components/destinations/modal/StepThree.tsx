
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface StepThreeProps {
  exportFormat: string;
  setExportFormat: (format: string) => void;
  saveToStorage: boolean;
  setSaveToStorage: (save: boolean) => void;
}

const StepThree: React.FC<StepThreeProps> = ({ 
  exportFormat, 
  setExportFormat, 
  saveToStorage,
  setSaveToStorage
}) => {
  const { profile } = useAuth();
  const isPro = profile?.subscription_tier === 'pro';

  return (
    <div className="space-y-4 py-4">
      <p className="text-sm text-muted-foreground mb-4">
        Configure how you want your data to be exported to this destination.
      </p>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="export_format">Export Format</Label>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger id="export_format">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CSV">CSV</SelectItem>
              <SelectItem value="JSON">JSON</SelectItem>
              <SelectItem value="Parquet">Parquet</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between py-4">
          <div className="space-y-0.5">
            <div className="flex items-center">
              <Label htmlFor="save-to-storage" className="font-medium">
                Save to my Data Storage at the same time
              </Label>
              {isPro && (
                <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                  PRO
                </Badge>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Store exported data in your personal 50MB storage space</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {!isPro && (
              <p className="text-xs text-muted-foreground">
                This feature is only available for Pro users.
              </p>
            )}
          </div>
          <Switch
            id="save-to-storage"
            checked={saveToStorage}
            onCheckedChange={setSaveToStorage}
            disabled={!isPro}
          />
        </div>
      </div>
    </div>
  );
};

export default StepThree;
