
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ShoppingBag, FileText, UserCheck } from "lucide-react";

interface PredefinedDatasetStepProps {
  selectedTemplate: string;
  onSelectTemplate: (template: string) => void;
}

const PredefinedDatasetStep: React.FC<PredefinedDatasetStepProps> = ({
  selectedTemplate,
  onSelectTemplate
}) => {
  const templates = [
    {
      id: "products_basic",
      name: "Products Basic",
      description: "Basic product information including title, price, vendor, and type.",
      icon: <ShoppingBag className="h-4 w-4 mr-2 text-green-600" />
    },
    {
      id: "orders_basic",
      name: "Orders Basic",
      description: "Basic order information including order number, customer, total, and status.",
      icon: <FileText className="h-4 w-4 mr-2 text-blue-600" />
    },
    {
      id: "customers_basic",
      name: "Customers Basic",
      description: "Basic customer information including name, email, orders count, and total spent.",
      icon: <UserCheck className="h-4 w-4 mr-2 text-amber-600" />
    }
  ];
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select Predefined Dataset</h2>
      <p className="text-muted-foreground">
        Choose a pre-built dataset template to extract data.
      </p>
      
      <RadioGroup 
        value={selectedTemplate}
        onValueChange={onSelectTemplate}
        className="space-y-3 mt-4"
      >
        {templates.map((template) => (
          <div key={template.id}>
            <RadioGroupItem
              value={template.id}
              id={template.id}
              className="peer sr-only"
            />
            <Label
              htmlFor={template.id}
              className="peer-data-[state=checked]:border-primary flex flex-col items-start cursor-pointer rounded-lg border p-4 hover:bg-muted/50 peer-data-[state=checked]:bg-muted"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center">
                  {template.icon}
                  <span className="font-medium">{template.name}</span>
                </div>
                <div className="text-muted-foreground text-sm mt-1">
                  {template.description}
                </div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default PredefinedDatasetStep;
