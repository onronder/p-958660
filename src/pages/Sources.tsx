
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSources } from "@/hooks/useSources";
import { useShopifyCredentials } from "@/hooks/useShopifyCredentials";
import { useSourceSelection } from "@/hooks/useSourceSelection";
import InfoBanner from "@/components/InfoBanner";
import HelpFloatingButton from "@/components/help/HelpFloatingButton";
import SourceTypeSelector from "@/components/sources/SourceTypeSelector";
import ShopifyPrivateAppModal from "@/components/sources/ShopifyPrivateAppModal";
import SourcesHeader from "@/components/sources/SourcesHeader";
import SourcesList from "@/components/sources/SourcesList";
import { useState } from "react";

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
      source.source_type !== "Shopify" &&
      !source.is_deleted
    );
    
    return filteredSources;
  };

  const handleRefresh = () => {
    loadSources();
    loadCredentials();
  };

  const isLoading = isSourcesLoading || isCredentialsLoading;
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
