
import React from "react";
import { ShoppingBag, FileText, UserCheck } from "lucide-react";

interface PredefinedTemplatesListProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}

const PredefinedTemplatesList: React.FC<PredefinedTemplatesListProps> = ({
  selectedTemplate,
  onSelectTemplate
}) => {
  const predefinedTemplates = [
    {
      id: "products_basic",
      name: "Products Basic",
      description: "Basic product information including title, price, vendor, and type.",
      icon: <ShoppingBag className="h-6 w-6" />,
      color: "bg-green-100 text-green-600"
    },
    {
      id: "orders_basic",
      name: "Orders Basic",
      description: "Basic order information including order number, customer, total, and status.",
      icon: <FileText className="h-6 w-6" />,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: "customers_basic",
      name: "Customers Basic",
      description: "Basic customer information including name, email, orders count, and total spent.",
      icon: <UserCheck className="h-6 w-6" />,
      color: "bg-amber-100 text-amber-600"
    }
  ];

  return (
    <div className="grid gap-4">
      {predefinedTemplates.map((template) => (
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

export default PredefinedTemplatesList;
