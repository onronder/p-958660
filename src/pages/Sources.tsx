
import React, { useEffect, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useShopifyCredentials } from "@/hooks/useShopifyCredentials";
import ShopifyPrivateAppModal from "@/components/sources/ShopifyPrivateAppModal";
import ShopifyCredentialCard from "@/components/sources/ShopifyCredentialCard";

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

  const isLoading = isSourcesLoading || isCredentialsLoading;

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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Source
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/sources/add" className="cursor-pointer">
                  Add OAuth-based Source
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowShopifyModal(true)}>
                Add Shopify Private App
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading ? (
        <SourcesLoadingSkeleton />
      ) : (
        <>
          {shopifyCredentials.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Shopify Private App Connections</h2>
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
              </div>
            </div>
          )}

          <h2 className="text-xl font-semibold mb-4">OAuth Connections</h2>
          {sources.length > 0 ? (
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
        </>
      )}

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
