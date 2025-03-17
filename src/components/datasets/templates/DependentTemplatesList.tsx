
import React from "react";
import { Users, Tags } from "lucide-react";

interface DependentTemplatesListProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}

const DependentTemplatesList: React.FC<DependentTemplatesListProps> = ({
  selectedTemplate,
  onSelectTemplate
}) => {
  const dependentTemplates = [
    {
      id: "customer_with_orders",
      name: "Customers with Orders",
      description: "Customer profiles combined with their order history in a single dataset.",
      icon: <Users className="h-6 w-6" />,
      color: "bg-purple-100 text-purple-600"
    },
    {
      id: "products_with_metafields",
      name: "Products with Metafields",
      description: "Product information enriched with all associated metafields.",
      icon: <Tags className="h-6 w-6" />,
      color: "bg-indigo-100 text-indigo-600"
    }
  ];

  return (
    <div className="grid gap-4">
      {dependentTemplates.map((template) => (
        <div
          key={template.id}
          className={`border rounded-lg p-5 cursor-pointer transition-all hover:shadow-md ${
            selectedTemplate === template.id ? "border-primary ring-2 ring-primary/20" : ""
          }`}
          onClick={() => onSelectTemplate(template.id)}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-full mr-4 ${template.color}`}>
              {template.icon}
            </div>
            <div>
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {template.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DependentTemplatesList;
