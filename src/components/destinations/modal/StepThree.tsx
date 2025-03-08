
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StepThreeProps {
  exportFormat: string;
  setExportFormat: (format: string) => void;
  schedule: string;
  setSchedule: (schedule: string) => void;
}

const StepThree: React.FC<StepThreeProps> = ({ 
  exportFormat, 
  setExportFormat, 
  schedule, 
  setSchedule 
}) => {
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
        
        <div className="space-y-2">
          <Label htmlFor="schedule">Export Schedule</Label>
          <Select value={schedule} onValueChange={setSchedule}>
            <SelectTrigger id="schedule">
              <SelectValue placeholder="Select schedule" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Manual">Manual</SelectItem>
              <SelectItem value="Daily">Daily</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default StepThree;
