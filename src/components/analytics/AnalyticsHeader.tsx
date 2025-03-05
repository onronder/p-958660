
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface AnalyticsHeaderProps {
  onRefresh: () => void;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold text-primary">Analytics</h1>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={onRefresh}
      >
        <RefreshCw className="h-4 w-4" />
        Refresh
      </Button>
    </div>
  );
};

export default AnalyticsHeader;
