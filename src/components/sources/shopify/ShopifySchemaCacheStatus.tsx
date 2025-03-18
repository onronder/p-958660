
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { useSchemaCache } from "@/hooks/useSchemaCache";
import { formatDistanceToNow } from "date-fns";

interface ShopifySchemaCacheStatusProps {
  sourceId: string;
}

const ShopifySchemaCacheStatus: React.FC<ShopifySchemaCacheStatusProps> = ({ sourceId }) => {
  const { status, checkCacheStatus, refreshSchema } = useSchemaCache();
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  
  const sourceStatus = status[sourceId] || {
    isCaching: false,
    lastCached: null,
    error: null
  };
  
  useEffect(() => {
    if (sourceId) {
      checkCacheStatus(sourceId);
      setLastChecked(new Date());
    }
  }, [sourceId, checkCacheStatus]);
  
  const handleRefresh = () => {
    refreshSchema(sourceId, true);
    setLastChecked(new Date());
  };
  
  // Format the last cached time
  const getLastCachedText = () => {
    if (sourceStatus.error) {
      return (
        <div className="flex items-center text-destructive gap-1">
          <AlertTriangle className="h-4 w-4" />
          <span>Schema cache error</span>
        </div>
      );
    }
    
    if (sourceStatus.isCaching) {
      return <span className="text-muted-foreground">Updating schema cache...</span>;
    }
    
    if (!sourceStatus.lastCached) {
      return <span className="text-muted-foreground">Schema not cached yet</span>;
    }
    
    const lastCachedDate = new Date(sourceStatus.lastCached);
    const timeAgo = formatDistanceToNow(lastCachedDate, { addSuffix: true });
    
    return (
      <span className="text-muted-foreground">
        Schema cached {timeAgo}
      </span>
    );
  };
  
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm">
        {getLastCachedText()}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRefresh}
        disabled={sourceStatus.isCaching}
        className="h-8 px-2"
      >
        <RefreshCw className={`h-4 w-4 ${sourceStatus.isCaching ? 'animate-spin' : ''}`} />
        <span className="ml-2">Refresh Schema</span>
      </Button>
    </div>
  );
};

export default ShopifySchemaCacheStatus;
