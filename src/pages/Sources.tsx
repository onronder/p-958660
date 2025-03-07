
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import InfoBanner from "@/components/InfoBanner";
import SourceCard from "@/components/SourceCard";
import EmptySourcesState from "@/components/EmptySourcesState";
import SourcesLoadingSkeleton from "@/components/SourcesLoadingSkeleton";
import { useSources } from "@/hooks/useSources";
import HelpFloatingButton from "@/components/help/HelpFloatingButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

const Sources = () => {
  const { 
    sources, 
    isLoading, 
    loadSources, 
    handleTestConnection, 
    handleDeleteSource 
  } = useSources();
  const { toast } = useToast();

  useEffect(() => {
    // Load sources when the component mounts
    loadSources();
  }, []);

  const handleHelpClick = () => {
    toast({
      title: "Sources Help",
      description: "FlowTechs connects to platforms like Shopify, WooCommerce, and databases.",
    });
  };

  return (
    <div className="space-y-8">
      <InfoBanner 
        messageId="sources-info"
        message={
          <span>
            <span className="font-bold">⚡ The My Sources</span> page allows you to connect and manage your data sources, such as Shopify or other platforms, ensuring seamless integration for data extraction and processing.
          </span>
        }
      />

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-primary">My Sources</h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handleHelpClick}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Learn about connecting data sources</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSources} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button asChild className="flex items-center gap-2">
            <Link to="/sources/add">
              <Plus className="h-4 w-4" />
              Add New Source
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <SourcesLoadingSkeleton />
      ) : sources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sources.map((source) => (
            <SourceCard 
              key={source.id}
              source={source}
              onTestConnection={handleTestConnection}
              onDelete={handleDeleteSource}
            />
          ))}
        </div>
      ) : (
        <EmptySourcesState />
      )}

      <HelpFloatingButton />
    </div>
  );
};

export default Sources;
