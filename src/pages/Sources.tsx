
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSources } from "@/hooks/useSources";
import { useDeletedSources } from "@/hooks/useDeletedSources";
import { useShopifyCredentials } from "@/hooks/useShopifyCredentials";
import { useSourceSelection } from "@/hooks/useSourceSelection";
import InfoBanner from "@/components/InfoBanner";
import HelpFloatingButton from "@/components/help/HelpFloatingButton";
import SourceTypeSelector from "@/components/sources/SourceTypeSelector";
import ShopifyPrivateAppModal from "@/components/sources/ShopifyPrivateAppModal";
import SourcesHeader from "@/components/sources/SourcesHeader";
import SourcesList from "@/components/sources/SourcesList";
import DeletedSourcesList from "@/components/sources/DeletedSourcesList";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

const Sources = () => {
  const { 
    sources, 
    isLoading: isSourcesLoading, 
    isDeletingSource,
    loadSources, 
    handleTestConnection, 
    handleDeleteSource 
  } = useSources();
  
  const {
    deletedSources,
    isLoading: isDeletedSourcesLoading,
    isRestoring,
    loadDeletedSources,
    handleRestoreSource
  } = useDeletedSources();
  
  const {
    credentials: shopifyCredentials,
    isLoading: isCredentialsLoading,
    loadCredentials,
    selectedCredential,
    setSelectedCredential
  } = useShopifyCredentials();
  
  const [showShopifyModal, setShowShopifyModal] = useState(false);
  const { 
    showSourceSelector, 
    setShowSourceSelector, 
    handleSourceSelection 
  } = useSourceSelection(() => setShowShopifyModal(true));
  
  const location = useLocation();

  useEffect(() => {
    // Load sources when the component mounts
    loadSources();
    loadDeletedSources();
    loadCredentials();
    
    // Check location state for modal flags
    if (location.state?.openShopifyModal) {
      setShowShopifyModal(true);
    } else if (location.state?.openSourceSelector) {
      setShowSourceSelector(true);
    }
  }, []);

  // Get a deduplicated list of sources
  // We prefer to show ShopifyCredentialCard for Shopify sources
  const getDisplaySources = () => {
    // Extract shopify credential IDs to filter out from regular sources
    const shopifyIds = shopifyCredentials.map(cred => cred.id);
    
    // Filter out regular sources that are already shown as Shopify credentials
    // and filter out soft-deleted sources
    const filteredSources = sources.filter(source => 
      !shopifyIds.includes(source.id) && 
      source.source_type !== "Shopify"
    );
    
    return filteredSources;
  };

  const handleRefresh = () => {
    loadSources();
    loadDeletedSources();
    loadCredentials();
  };

  const isLoading = isSourcesLoading || isCredentialsLoading || isDeletedSourcesLoading;
  const displaySources = getDisplaySources();

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

      <SourcesHeader 
        onRefresh={handleRefresh}
        onAddSource={() => setShowSourceSelector(true)}
      />

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Active Sources</h3>
        <SourcesList
          isLoading={isLoading}
          shopifyCredentials={shopifyCredentials}
          displaySources={displaySources}
          onTestConnection={handleTestConnection}
          onDeleteSource={handleDeleteSource}
          onEditCredential={(cred) => {
            setSelectedCredential(cred);
            setShowShopifyModal(true);
          }}
          onRefreshCredentials={loadCredentials}
          onAddSource={() => setShowSourceSelector(true)}
        />
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-semibold">Deleted Sources</h3>
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        
        <p className="text-muted-foreground mb-6">
          Deleted sources remain inactive for 30 days after which they are permanently deleted.
        </p>
        
        <DeletedSourcesList
          deletedSources={deletedSources}
          isLoading={isDeletedSourcesLoading}
          isRestoring={isRestoring}
          onRestoreSource={handleRestoreSource}
        />
      </Card>

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
