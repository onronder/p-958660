
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, Check } from "lucide-react";
import { useSchemaCache } from "@/hooks/useSchemaCache";
import { formatDistanceToNow } from "date-fns";

interface ShopifySchemaCacheStatusProps {
  sourceId: string;
}

const ShopifySchemaCacheStatus: React.FC<ShopifySchemaCacheStatusProps> = ({ sourceId }) => {
  const { status, checkCacheStatus, refreshSchema } = useSchemaCache();
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [apiVersion, setApiVersion] = useState<string | null>(null);
  
  const sourceStatus = status[sourceId] || {
    isCaching: false,
    lastCached: null,
    error: null
  };
  
  useEffect(() => {
    if (sourceId) {
      const checkStatus = async () => {
        const result = await checkCacheStatus(sourceId);
        if (result && result.api_version) {
          setApiVersion(result.api_version);
        }
      };
      
      checkStatus();
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
      <div className="flex flex-col">
        <span className="text-muted-foreground">
          Schema cached {timeAgo}
        </span>
        {apiVersion && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <Check className="h-3 w-3 mr-1 text-green-500" />
            <span>Using Shopify API v{apiVersion}</span>
          </div>
        )}
      </div>
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
