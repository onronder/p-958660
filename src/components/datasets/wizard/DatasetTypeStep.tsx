
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileIcon, FileLineChart, FileEdit, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DatasetTypeStepProps {
  selectedType: string;
  onSelectType: (type: "predefined" | "dependent" | "custom") => void;
  isShopifySource?: boolean;
}

const DatasetTypeStep: React.FC<DatasetTypeStepProps> = ({
  selectedType,
  onSelectType,
  isShopifySource = false
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select Dataset Type</h2>
      <p className="text-muted-foreground">
        Choose how you want to extract your data.
      </p>
      
      {!isShopifySource && (
        <Alert variant="warning" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Predefined and Dependent datasets are only available for Shopify data sources. You can only create custom datasets for this source type.
          </AlertDescription>
        </Alert>
      )}
      
      <RadioGroup 
        value={selectedType}
        onValueChange={(value) => onSelectType(value as "predefined" | "dependent" | "custom")}
        className="space-y-3 mt-4"
      >
        <div>
          <RadioGroupItem
            value="predefined"
            id="predefined"
            className="peer sr-only"
            disabled={!isShopifySource}
          />
          <Label
            htmlFor="predefined"
            className={`peer-data-[state=checked]:border-primary flex flex-col items-start cursor-pointer rounded-lg border p-4 hover:bg-muted/50 peer-data-[state=checked]:bg-muted ${!isShopifySource ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <FileIcon className="h-5 w-5 mr-2 text-green-600" />
                  <span className="font-medium">Predefined Datasets</span>
                </div>
                <Badge variant="secondary" className="ml-auto text-xs">Recommended for beginners</Badge>
              </div>
              <div className="text-muted-foreground text-sm mt-2">
                Use ready-made templates to extract common data types like Products, Orders, or Customers.
              </div>
            </div>
          </Label>
        </div>
        
        <div>
          <RadioGroupItem
            value="dependent"
            id="dependent"
            className="peer sr-only"
            disabled={!isShopifySource}
          />
          <Label
            htmlFor="dependent"
            className={`peer-data-[state=checked]:border-primary flex flex-col items-start cursor-pointer rounded-lg border p-4 hover:bg-muted/50 peer-data-[state=checked]:bg-muted ${!isShopifySource ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <FileLineChart className="h-5 w-5 mr-2 text-purple-600" />
                  <span className="font-medium">Dependent Queries</span>
                </div>
                <Badge variant="secondary" className="ml-auto text-xs">Advanced</Badge>
              </div>
              <div className="text-muted-foreground text-sm mt-2">
                Extract complex data relationships that require multiple queries, such as Product Variants or Order Line Items.
              </div>
            </div>
          </Label>
        </div>
        
        <div>
          <RadioGroupItem
            value="custom"
            id="custom"
            className="peer sr-only"
          />
          <Label
            htmlFor="custom"
            className="peer-data-[state=checked]:border-primary flex flex-col items-start cursor-pointer rounded-lg border p-4 hover:bg-muted/50 peer-data-[state=checked]:bg-muted"
          >
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <FileEdit className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-medium">Custom Dataset</span>
                </div>
                <Badge variant="secondary" className="ml-auto text-xs">Expert</Badge>
              </div>
              <div className="text-muted-foreground text-sm mt-2">
                Build your own custom extraction by selecting specific fields and relationships.
              </div>
            </div>
          </Label>
        </div>
      </RadioGroup>

      <div className="p-4 bg-muted/50 rounded-lg mt-6 border border-muted">
        <h3 className="text-sm font-medium mb-2">About Dataset Types</h3>
        <p className="text-sm text-muted-foreground">
          {selectedType === "predefined" && 
            "Predefined datasets are the easiest way to get started. They provide ready-to-use templates for common Shopify data needs without any complex setup."
          }
          {selectedType === "dependent" && 
            "Dependent queries allow you to extract related Shopify data across multiple resources, like orders with their line items or products with their variants and inventory."
          }
          {selectedType === "custom" && 
            "Custom datasets give you complete control over your data extraction by writing your own GraphQL queries. Best for specific requirements."
          }
        </p>
      </div>
    </div>
  );
};

export default DatasetTypeStep;
