
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SourcesList from "@/components/sources/SourcesList";
import DeletedSourcesList from "@/components/sources/DeletedSourcesList";
import { Source } from "@/types/source";

interface SourcesStatusTabsProps {
  sources: Source[];
  deletedSources: Source[];
  isLoading: boolean;
  isDeletingSource: boolean;
  isRestoring: boolean;
  shopifyCredentials: any[];
  onTestConnection: (sourceId: string) => void;
  onDeleteSource: (sourceId: string) => void;
  onRestoreSource: (sourceId: string) => void;
  onEditCredential: (credential: any) => void;
  onRefreshCredentials: () => void;
  onAddSource: () => void;
}

const SourcesStatusTabs: React.FC<SourcesStatusTabsProps> = ({
  sources,
  deletedSources,
  isLoading,
  isDeletingSource,
  isRestoring,
  shopifyCredentials,
  onTestConnection,
  onDeleteSource,
  onRestoreSource,
  onEditCredential,
  onRefreshCredentials,
  onAddSource
}) => {
  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="active">Active Sources</TabsTrigger>
        <TabsTrigger value="deleted">
          Deleted Sources
          {deletedSources.length > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-muted">
              {deletedSources.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="active" className="mt-0">
        <SourcesList
          isLoading={isLoading}
          shopifyCredentials={shopifyCredentials}
          displaySources={sources}
          onTestConnection={onTestConnection}
          onDeleteSource={onDeleteSource}
          onEditCredential={onEditCredential}
          onRefreshCredentials={onRefreshCredentials}
          onAddSource={onAddSource}
        />
      </TabsContent>
      
      <TabsContent value="deleted" className="mt-0">
        <DeletedSourcesList
          deletedSources={deletedSources}
          isLoading={isLoading}
          isRestoring={isRestoring}
          onRestoreSource={onRestoreSource}
        />
      </TabsContent>
    </Tabs>
  );
};

export default SourcesStatusTabs;
