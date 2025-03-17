
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateDataset } from "@/hooks/useCreateDataset";
import { ShoppingBag, UserCheck, FileText, Users, Tags, FileEdit } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const DatasetDetails = () => {
  const navigate = useNavigate();
  const { 
    datasetType, 
    templateName, 
    setTemplateName,
    customQuery,
    setCustomQuery
  } = useCreateDataset();
  
  const [activeTab, setActiveTab] = useState(datasetType);
  
  const handleBack = () => {
    navigate("/create-dataset/type");
  };
  
  const handleNext = () => {
    navigate("/create-dataset/preview");
  };
  
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
  
  const canProceed = () => {
    if (datasetType === "predefined" || datasetType === "dependent") {
      return !!templateName;
    } else if (datasetType === "custom") {
      return !!customQuery;
    }
    return false;
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Dataset Details</h2>
        <p className="text-muted-foreground mt-1">
          {datasetType === "predefined" && "Choose a pre-built dataset template to extract data."}
          {datasetType === "dependent" && "These templates combine multiple related data types."}
          {datasetType === "custom" && "Create your own custom query to extract data."}
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "predefined" | "dependent" | "custom")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predefined">Predefined</TabsTrigger>
          <TabsTrigger value="dependent">Dependent</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
        
        <TabsContent value="predefined" className="pt-4">
          <div className="grid gap-4">
            {predefinedTemplates.map((template) => (
              <div
                key={template.id}
                className={`border rounded-lg p-5 cursor-pointer transition-all hover:shadow-md ${
                  templateName === template.id ? "border-primary ring-2 ring-primary/20" : ""
                }`}
                onClick={() => setTemplateName(template.id)}
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
        </TabsContent>
        
        <TabsContent value="dependent" className="pt-4">
          <div className="grid gap-4">
            {dependentTemplates.map((template) => (
              <div
                key={template.id}
                className={`border rounded-lg p-5 cursor-pointer transition-all hover:shadow-md ${
                  templateName === template.id ? "border-primary ring-2 ring-primary/20" : ""
                }`}
                onClick={() => setTemplateName(template.id)}
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
        </TabsContent>
        
        <TabsContent value="custom" className="pt-4">
          <div className="border rounded-lg p-5">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full mr-4 bg-blue-100 text-blue-600">
                <FileEdit className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium">Custom GraphQL Query</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Write a valid GraphQL query to extract data
                </p>
              </div>
            </div>
            
            <Textarea 
              placeholder="Enter your GraphQL query here..."
              className="font-mono h-60 resize-none"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
            />
            
            <div className="mt-4">
              <h4 className="text-sm font-medium">Example Query:</h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto mt-2">
                {`{
  products(first: 10) {
    edges {
      node {
        id
        title
        description
        variants {
          edges {
            node {
              id
              price
            }
          }
        }
      }
    }
  }
}`}
              </pre>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between pt-4">
        <Button
          onClick={handleBack}
          variant="outline"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default DatasetDetails;
