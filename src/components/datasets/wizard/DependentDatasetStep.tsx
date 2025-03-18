
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Users, Tags } from "lucide-react";

interface DependentDatasetStepProps {
  selectedTemplate: string;
  onSelectTemplate: (template: string) => void;
}

const DependentDatasetStep: React.FC<DependentDatasetStepProps> = ({
  selectedTemplate,
  onSelectTemplate
}) => {
  const templates = [
    {
      id: "customer_with_orders",
      name: "Customers with Orders",
      description: "Customer profiles combined with their order history in a single dataset.",
      icon: <Users className="h-4 w-4 mr-2 text-purple-600" />
    },
    {
      id: "products_with_metafields",
      name: "Products with Metafields",
      description: "Product information enriched with all associated metafields.",
      icon: <Tags className="h-4 w-4 mr-2 text-blue-600" />
    }
  ];
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select Dependent Query Template</h2>
      <p className="text-muted-foreground">
        These templates combine multiple related data types using dependent queries.
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

export default DependentDatasetStep;
