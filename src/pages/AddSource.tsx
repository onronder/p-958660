
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { sourceOptions, addSource } from "@/services/sourceDataService";
import { SourceType } from "@/components/sources/SourceTypeCard";
import SourceSelectionStep from "@/components/sources/SourceSelectionStep";
import SourceConfigStep from "@/components/sources/SourceConfigStep";
import ShopifyOAuthCallback from "@/components/sources/ShopifyOAuthCallback";
import InfoBanner from "@/components/InfoBanner";
import { HelpCircle } from "lucide-react";
import HelpFloatingButton from "@/components/help/HelpFloatingButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AddSource = () => {
  const [step, setStep] = useState<"select-source" | "configure" | "oauth-callback">("select-source");
  const [selectedSource, setSelectedSource] = useState<SourceType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sourceName, setSourceName] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [callbackUrl, setCallbackUrl] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Check if we're in an OAuth callback scenario
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has('code') && searchParams.has('shop')) {
      setStep("oauth-callback");
    }
  }, [location]);

  const handleSourceSelection = (sourceType: SourceType) => {
    setSelectedSource(sourceType);
    setStep("configure");
  };

  const handleBack = () => {
    if (step === "configure") {
      setStep("select-source");
      setSelectedSource(null);
    } else {
      navigate("/sources");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSource === "Shopify") {
      // This is now handled by the ShopifyConfigForm component
      return;
    }
    
    if (!sourceName || !storeUrl || !apiKey) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to add a source.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare credentials object based on source type
      let credentials: any = {};
      
      if (selectedSource === "WooCommerce") {
        credentials = { apiKey, apiSecret };
      }
      
      // Insert new source using the service
      await addSource(user.id, sourceName, storeUrl, selectedSource as SourceType, credentials);
      
      toast({
        title: "Source Connected",
        description: `Successfully connected to ${sourceName}.`,
      });
      
      navigate("/sources");
    } catch (error) {
      console.error("Error connecting source:", error);
      toast({
        title: "Connection Failed",
        description: "There was an error connecting to your source. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const showHelpTip = () => {
    toast({
      title: "Need Help?",
      description: "Check our documentation for detailed instructions on connecting data sources.",
    });
  };

  // Render the appropriate step
  const renderStep = () => {
    if (step === "oauth-callback") {
      return <ShopifyOAuthCallback />;
    }
    
    if (step === "select-source") {
      return (
        <>
          <InfoBanner 
            message={
              <span>
                Select the type of data source you want to connect. Each source type requires different authentication methods.
              </span>
            }
          />
          <div className="flex items-center mb-4">
            <h1 className="text-3xl font-bold text-primary">Add New Source</h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="ml-2" onClick={showHelpTip}>
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Learn about connecting data sources</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <SourceSelectionStep 
            sourceOptions={sourceOptions}
            onSourceSelect={handleSourceSelection}
            onBack={handleBack}
          />
        </>
      );
    }
    
    return (
      <SourceConfigStep
        selectedSource={selectedSource as SourceType}
        isSubmitting={isSubmitting}
        sourceName={sourceName}
        setSourceName={setSourceName}
        storeUrl={storeUrl}
        setStoreUrl={setStoreUrl}
        apiKey={apiKey}
        setApiKey={setApiKey}
        apiSecret={apiSecret}
        setApiSecret={setApiSecret}
        callbackUrl={callbackUrl}
        setCallbackUrl={setCallbackUrl}
        onBack={handleBack}
        onSubmit={handleSubmit}
        onComplete={() => navigate("/sources")}
      />
    );
  };

  return (
    <div className="space-y-8">
      {renderStep()}
      <HelpFloatingButton />
    </div>
  );
};

export default AddSource;
