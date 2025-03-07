
import React from "react";
import { Source } from "@/types/source";
import SourceCard from "@/components/SourceCard";
import ShopifyCredentialCard from "@/components/sources/ShopifyCredentialCard";
import EmptySourcesState from "@/components/EmptySourcesState";
import SourcesLoadingSkeleton from "@/components/SourcesLoadingSkeleton";

interface SourcesListProps {
  isLoading: boolean;
  shopifyCredentials: any[];
  displaySources: Source[];
  onTestConnection: (sourceId: string) => void;
  onDeleteSource: (sourceId: string) => void;
  onEditCredential: (credential: any) => void;
  onRefreshCredentials: () => void;
  onAddSource: () => void;
}

const SourcesList: React.FC<SourcesListProps> = ({
  isLoading,
  shopifyCredentials,
  displaySources,
  onTestConnection,
  onDeleteSource,
  onEditCredential,
  onRefreshCredentials,
  onAddSource
}) => {
  const hasAnyConnections = shopifyCredentials.length > 0 || displaySources.length > 0;

  if (isLoading) {
    return <SourcesLoadingSkeleton />;
  }

  if (!hasAnyConnections) {
    return <EmptySourcesState onAddSource={onAddSource} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {shopifyCredentials.map((credential) => (
        <ShopifyCredentialCard
          key={credential.id}
          credential={credential}
          onRefresh={onRefreshCredentials}
          onEdit={onEditCredential}
        />
      ))}
      
      {displaySources.map((source) => (
        <SourceCard 
          key={source.id}
          source={source}
          onTestConnection={onTestConnection}
          onDelete={onDeleteSource}
        />
      ))}
    </div>
  );
};

export default SourcesList;
