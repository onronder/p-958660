import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, HelpCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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
import { useShopifyCredentials } from "@/hooks/useShopifyCredentials";
import ShopifyPrivateAppModal from "@/components/sources/ShopifyPrivateAppModal";
import ShopifyCredentialCard from "@/components/sources/ShopifyCredentialCard";
import SourceTypeSelector from "@/components/sources/SourceTypeSelector";

const Sources = () => {
  const { 
    sources, 
    isLoading: isSourcesLoading, 
    loadSources, 
    handleTestConnection, 
    handleDeleteSource 
  } = useSources();
  
  const {
    credentials: shopifyCredentials,
    isLoading: isCredentialsLoading,
    loadCredentials,
    selectedCredential,
    setSelectedCredential
  } = useShopifyCredentials();
  
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [showShopifyModal, setShowShopifyModal] = useState(false);
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    // Load sources when the component mounts
    loadSources();
    loadCredentials();
    
    // Check location state for modal flags
    if (location.state?.openShopifyModal) {
      setShowShopifyModal(true);
    } else if (location.state?.openSourceSelector) {
      setShowSourceSelector(true);
    }
  }, []);

  const handleHelpClick = () => {
    toast({
      title: "Sources Help",
      description: "FlowTechs connects to platforms like Shopify, WooCommerce, and databases.",
    });
  };

  const handleSourceSelection = (sourceType: string) => {
    setShowSourceSelector(false);
    
    // Handle source type selection
    if (sourceType === "shopify") {
      setShowShopifyModal(true);
    } else if (sourceType === "woocommerce") {
      toast({
        title: "Coming Soon",
        description: "WooCommerce integration is coming soon.",
      });
    } else if (sourceType === "api") {
      toast({
        title: "Coming Soon",
        description: "Custom API integration is coming soon.",
      });
    } else if (sourceType === "googlesheets") {
      toast({
        title: "Coming Soon",
        description: "Google Sheets integration is coming soon.",
      });
    }
  };

  // Get a deduplicated list of sources
  // We prefer to show ShopifyCredentialCard for Shopify sources
  const getDisplaySources = () => {
    // Extract shopify credential IDs to filter out from regular sources
    const shopifyIds = shopifyCredentials.map(cred => cred.id);
    
    // Filter out regular sources that are already shown as Shopify credentials
    // and filter out soft-deleted sources
    const filteredSources = sources.filter(source => 
      !shopifyIds.includes(source.id) && 
      source.source_type !== "Shopify" &&
      !source.is_deleted
    );
    
    return filteredSources;
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      await deleteSource(sourceId);
      toast({
        title: "Source Deleted",
        description: "The source will be permanently deleted after 30 days.",
      });
      loadSources();
    } catch (error) {
      console.error("Error deleting source:", error);
      toast({
        title: "Error",
        description: "Failed to delete source. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isLoading = isSourcesLoading || isCredentialsLoading;
  const displaySources = getDisplaySources();
  const hasAnyConnections = shopifyCredentials.length > 0 || displaySources.length > 0;

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
          <Button 
            onClick={() => {
              loadSources();
              loadCredentials();
            }} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          <Button onClick={() => setShowSourceSelector(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Source
          </Button>
        </div>
      </div>

      {isLoading ? (
        <SourcesLoadingSkeleton />
      ) : (
        <>
          {hasAnyConnections ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shopifyCredentials.map((credential) => (
                <ShopifyCredentialCard
                  key={credential.id}
                  credential={credential}
                  onRefresh={loadCredentials}
                  onEdit={(cred) => {
                    setSelectedCredential(cred);
                    setShowShopifyModal(true);
                  }}
                />
              ))}
              
              {displaySources.map((source) => (
                <SourceCard 
                  key={source.id}
                  source={source}
                  onTestConnection={handleTestConnection}
                  onDelete={handleDeleteSource}
                />
              ))}
            </div>
          ) : (
            <EmptySourcesState onAddSource={() => setShowSourceSelector(true)} />
          )}
        </>
      )}

      <SourceTypeSelector
        open={showSourceSelector}
        onOpenChange={setShowSourceSelector}
        onSelectSource={handleSourceSelection}
      />

      <ShopifyPrivateAppModal
        open={showShopifyModal}
        onOpenChange={setShowShopifyModal}
        onSuccess={() => {
          loadCredentials();
          setSelectedCredential(null);
        }}
      />

      <HelpFloatingButton />
    </div>
  );
};

export default Sources;
