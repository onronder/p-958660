
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { sourceOptions, addSource } from "@/services/sourceDataService";
import { SourceType } from "@/components/sources/SourceTypeCard";
import SourceSelectionStep from "@/components/sources/SourceSelectionStep";
import SourceConfigStep from "@/components/sources/SourceConfigStep";

const AddSource = () => {
  const [step, setStep] = useState<"select-source" | "configure">("select-source");
  const [selectedSource, setSelectedSource] = useState<SourceType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sourceName, setSourceName] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [callbackUrl, setCallbackUrl] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

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
      
      if (selectedSource === "Shopify") {
        credentials = { apiKey, callbackUrl };
      } else if (selectedSource === "WooCommerce") {
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

  return (
    <div className="space-y-8">
      {step === "select-source" ? (
        <SourceSelectionStep 
          sourceOptions={sourceOptions}
          onSourceSelect={handleSourceSelection}
          onBack={handleBack}
        />
      ) : (
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
        />
      )}
    </div>
  );
};

export default AddSource;
