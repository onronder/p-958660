
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Source } from "@/types/source";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Database, CheckCircle2, Globe, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SourceSelectionStepProps {
  sources: Source[];
  selectedSourceId: string;
  onSelectSource: (id: string, name: string) => void;
  onTestConnection?: () => void;
}

const SourceSelectionStep: React.FC<SourceSelectionStepProps> = ({
  sources,
  selectedSourceId,
  onSelectSource,
  onTestConnection
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  
  // Filter sources based on search term
  const filteredSources = sources.filter(source => 
    source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.url.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Function to get the appropriate icon based on source type
  const getSourceIcon = (sourceType: string) => {
    switch (sourceType.toLowerCase()) {
      case 'shopify':
        return <ShoppingBag className="h-5 w-5 text-green-600" />;
      case 'woocommerce':
        return <Globe className="h-5 w-5 text-blue-600" />;
      default:
        return <Database className="h-5 w-5 text-purple-600" />;
    }
  };

  if (sources.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="rounded-full bg-amber-100 p-3 w-12 h-12 flex items-center justify-center mx-auto">
          <ShoppingBag className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="mt-3 text-lg font-semibold">No data sources available</h3>
        <p className="text-muted-foreground mt-1 mb-4">
          You need to connect a data source before creating a dataset.
        </p>
        <a 
          href="/sources" 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Connect Data Source
        </a>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Select Data Source</h2>
        <p className="text-muted-foreground">
          Choose the data source you want to extract data from. Your dataset will be built from this source.
        </p>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search sources..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSources.map((source) => (
          <Card
            key={source.id}
            className={`p-4 cursor-pointer hover:border-primary/50 transition-colors ${
              selectedSourceId === source.id ? 'border-primary bg-muted/50' : ''
            }`}
            onClick={() => onSelectSource(source.id, source.name)}
          >
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-muted p-2 flex-shrink-0">
                {getSourceIcon(source.source_type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium truncate">{source.name}</h3>
                  {selectedSourceId === source.id && (
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{source.url}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={source.status === 'Active' ? 'success' : source.status === 'Inactive' ? 'secondary' : 'outline'}
                    className="text-xs py-0 h-5"
                  >
                    {source.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {source.source_type}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {filteredSources.length === 0 && (
        <div className="text-center py-4 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">No sources found matching "{searchTerm}"</p>
        </div>
      )}
      
      {selectedSourceId && onTestConnection && (
        <div className="flex justify-end mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onTestConnection}
            className="flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Test Connection
          </Button>
        </div>
      )}
    </div>
  );
};

const Badge = ({ children, variant, className = "" }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  
  return (
    <span className={`inline-flex items-center px-2 rounded-full text-xs font-medium ${getVariantClasses()} ${className}`}>
      {children}
    </span>
  );
};

export default SourceSelectionStep;
