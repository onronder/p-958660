
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RefreshCw, AlertTriangle, Check, InfoIcon, Clock } from "lucide-react";
import { useSchemaCache } from "@/hooks/useSchemaCache";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

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

  // Calculate number of days since last refresh
  const getDaysSinceRefresh = () => {
    if (!sourceStatus.lastCached) return null;
    
    const lastCachedDate = new Date(sourceStatus.lastCached);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastCachedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    return diffDays;
  };

  const daysSinceRefresh = getDaysSinceRefresh();
  
  return (
    <div className="space-y-2">
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
      
      {sourceStatus.lastCached && (
        <Accordion type="single" collapsible className="border rounded-md">
          <AccordionItem value="schema-details" className="border-0">
            <AccordionTrigger className="py-2 px-3 text-xs">
              <div className="flex items-center gap-2">
                <InfoIcon className="h-3.5 w-3.5" />
                <span>Schema details</span>
                
                {daysSinceRefresh !== null && daysSinceRefresh > 6 && (
                  <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                    <Clock className="h-3 w-3 mr-1" />
                    Schema refresh due
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-2 text-xs text-muted-foreground">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span>API Version:</span>
                  <span className="font-mono">{apiVersion || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last updated:</span>
                  <span>{sourceStatus.lastCached ? new Date(sourceStatus.lastCached).toLocaleString() : 'Never'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Age:</span>
                  <span>{daysSinceRefresh !== null ? `${daysSinceRefresh} days` : 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Auto-refresh:</span>
                  <span>Every 7 days</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};

export default ShopifySchemaCacheStatus;
