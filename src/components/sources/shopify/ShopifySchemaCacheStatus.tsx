
import React, { useEffect } from "react";
import { useSchemaCache } from "@/hooks/useSchemaCache";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ShopifySchemaCacheStatusProps {
  sourceId: string;
}

const ShopifySchemaCacheStatus: React.FC<ShopifySchemaCacheStatusProps> = ({ sourceId }) => {
  const { status, refreshSchema, checkCacheStatus } = useSchemaCache();
  
  // Get status for this specific source
  const sourceStatus = status[sourceId] || { isCaching: false, lastCached: null, error: null };
  
  useEffect(() => {
    if (sourceId) {
      checkCacheStatus(sourceId);
    }
  }, [sourceId, checkCacheStatus]);
  
  const handleRefresh = () => {
    refreshSchema(sourceId, true);
  };
  
  // Format the last cached time
  const formattedLastCached = sourceStatus.lastCached 
    ? formatDistanceToNow(new Date(sourceStatus.lastCached), { addSuffix: true })
    : "never";
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Schema cache:</span>
          {sourceStatus.isCaching ? (
            <Badge variant="outline" className="bg-blue-50 text-blue-800">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Refreshing...
            </Badge>
          ) : sourceStatus.lastCached ? (
            <Badge variant="outline" className="bg-green-50 text-green-800">
              Cached {formattedLastCached}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
              Not cached
            </Badge>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={sourceStatus.isCaching}
        >
          {sourceStatus.isCaching ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh Schema
            </>
          )}
        </Button>
      </div>
      
      {sourceStatus.error && (
        <div className="text-sm text-red-500">
          Error: {sourceStatus.error}
        </div>
      )}
    </div>
  );
};

export default ShopifySchemaCacheStatus;
