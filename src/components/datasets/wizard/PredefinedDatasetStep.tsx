
import React, { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ShoppingBag, FileText, UserCheck, Loader2 } from "lucide-react";
import { usePredefinedTemplates } from "@/hooks/datasets/usePredefinedDatasets";

interface PredefinedDatasetStepProps {
  selectedTemplate: string;
  onSelectTemplate: (template: string) => void;
  sourceType?: string;
}

interface TemplateDisplay {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const PredefinedDatasetStep: React.FC<PredefinedDatasetStepProps> = ({
  selectedTemplate,
  onSelectTemplate,
  sourceType = 'shopify'
}) => {
  const { data: predefinedTemplates, isLoading, error } = usePredefinedTemplates(sourceType);
  const [templates, setTemplates] = useState<TemplateDisplay[]>([]);

  // Map predefined templates to display templates with icons
  useEffect(() => {
    if (predefinedTemplates?.length) {
      const mappedTemplates = predefinedTemplates.map(template => {
        let icon = <ShoppingBag className="h-4 w-4 mr-2" />;
        let color = 'text-green-600';
        
        if (template.template_key.includes('order')) {
          icon = <FileText className="h-4 w-4 mr-2" />;
          color = 'text-blue-600';
        } else if (template.template_key.includes('customer')) {
          icon = <UserCheck className="h-4 w-4 mr-2" />;
          color = 'text-amber-600';
        }
        
        return {
          id: template.id,
          name: template.name,
          description: template.description,
          icon: React.cloneElement(icon as React.ReactElement, { className: `h-4 w-4 mr-2 ${color}` }),
          color: color.replace('text-', 'bg-').replace('-600', '-100')
        };
      });
      
      setTemplates(mappedTemplates);
      
      // If we have templates but none is selected, select the first one
      if (mappedTemplates.length > 0 && !selectedTemplate) {
        onSelectTemplate(mappedTemplates[0].id);
      }
    }
  }, [predefinedTemplates, selectedTemplate, onSelectTemplate]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading predefined templates. Please try again.
      </div>
    );
  }
  
  if (templates.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No predefined templates available for this source type.
      </div>
    );
  }
  
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
