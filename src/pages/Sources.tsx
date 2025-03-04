
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import InfoBanner from "@/components/InfoBanner";
import SourceCard from "@/components/SourceCard";
import EmptySourcesState from "@/components/EmptySourcesState";
import SourcesLoadingSkeleton from "@/components/SourcesLoadingSkeleton";
import { useSources } from "@/hooks/useSources";

const Sources = () => {
  const { 
    sources, 
    isLoading, 
    loadSources, 
    handleTestConnection, 
    handleDeleteSource 
  } = useSources();

  return (
    <div className="space-y-8">
      <InfoBanner 
        message={
          <span>
            <span className="font-bold">⚡ The My Sources</span> page allows you to connect and manage your data sources, such as Shopify or other platforms, ensuring seamless integration for data extraction and processing.
          </span>
        }
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">My Sources</h1>
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
    </div>
  );
};

export default Sources;
