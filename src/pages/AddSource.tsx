
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SourceType = "Shopify" | "WooCommerce" | "Custom API" | "Google Sheets";

const sourceOptions: { id: SourceType; title: string; description: string; availableStatus: "available" | "coming-soon" }[] = [
  {
    id: "Shopify",
    title: "Shopify",
    description: "Connect to your Shopify store to import products, orders, and customer data",
    availableStatus: "available",
  },
  {
    id: "WooCommerce",
    title: "WooCommerce",
    description: "Import data from your WordPress WooCommerce store",
    availableStatus: "available",
  },
  {
    id: "Custom API",
    title: "Custom API",
    description: "Connect to a custom RESTful API endpoint",
    availableStatus: "coming-soon",
  },
  {
    id: "Google Sheets",
    title: "Google Sheets",
    description: "Import data from Google Sheets spreadsheets",
    availableStatus: "coming-soon",
  },
];

const AddSource = () => {
  const [step, setStep] = useState<"select-source" | "configure">("select-source");
  const [selectedSource, setSelectedSource] = useState<SourceType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sourceName, setSourceName] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

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
    
    try {
      setIsSubmitting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would call an API endpoint or Supabase:
      /*
      await supabase.from('sources').insert({
        name: sourceName,
        url: storeUrl,
        source_type: selectedSource,
        status: 'Pending',
        user_id: user.id,
        credentials: { apiKey, apiSecret } // This would be encrypted
      });
      */
      
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

  const renderSourceSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Add New Source</h1>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sources
        </Button>
      </div>
      
      <p className="text-muted-foreground">
        Select the type of data source you want to connect to FlowTechs.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sourceOptions.map((source) => (
          <Card 
            key={source.id}
            className={`cursor-pointer hover:border-primary transition-all ${
              source.availableStatus === "coming-soon" ? "opacity-60" : ""
            }`}
            onClick={() => source.availableStatus === "available" && handleSourceSelection(source.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {source.title}
                {source.availableStatus === "coming-soon" && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                )}
              </CardTitle>
              <CardDescription>{source.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderConfiguration = () => {
    let fields;
    
    if (selectedSource === "Shopify") {
      fields = (
        <>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="sourceName">Source Name</Label>
              <Input
                id="sourceName"
                placeholder="My Shopify Store"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="storeUrl">Store URL</Label>
              <Input
                id="storeUrl"
                placeholder="mystore.myshopify.com"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The full URL of your Shopify store
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">Admin API Access Token</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="shpat_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Found in your Shopify Admin under Apps &gt; Develop apps &gt; Create an app
              </p>
            </div>
          </div>
        </>
      );
    } else if (selectedSource === "WooCommerce") {
      fields = (
        <>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="sourceName">Source Name</Label>
              <Input
                id="sourceName"
                placeholder="My WooCommerce Store"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="storeUrl">Store URL</Label>
              <Input
                id="storeUrl"
                placeholder="https://example.com"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">Consumer Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="ck_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiSecret">Consumer Secret</Label>
              <Input
                id="apiSecret"
                type="password"
                placeholder="cs_..."
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Found in WooCommerce &gt; Settings &gt; Advanced &gt; REST API
              </p>
            </div>
          </div>
        </>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Configure {selectedSource}</h1>
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sources
          </Button>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Connection Details</CardTitle>
              <CardDescription>
                Enter the required information to connect to your {selectedSource} account.
              </CardDescription>
            </CardHeader>
            
            <CardContent>{fields}</CardContent>
            
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleBack}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Connect Source
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {step === "select-source" ? renderSourceSelection() : renderConfiguration()}
    </div>
  );
};

export default AddSource;
