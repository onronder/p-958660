import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from 'react';
import { PredefinedDatasetTemplate } from '@/types/dataset';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';

export interface CreateDatasetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (templateId: string) => void; // Add onSubmit prop
}

const CreateDatasetDialog: React.FC<CreateDatasetDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit
}) => {
  const [templates, setTemplates] = useState<PredefinedDatasetTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('predefined_dataset_templates')
          .select('*');

        if (error) {
          console.error('Error fetching templates:', error);
          return;
        }

        setTemplates(data || []);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleSubmit = () => {
    if (selectedTemplate) {
      onSubmit(selectedTemplate);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create Dataset from Template</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          <TabsContent value="templates" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Loading templates...</span>
              </div>
            ) : (
              <ScrollArea className="h-[300px] rounded-md border">
                <div className="grid gap-4 p-4">
                  {templates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="justify-start text-left"
                      onClick={() => setSelectedTemplate(template.id)}
                      active={selectedTemplate === template.id}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{template.name}</span>
                        {selectedTemplate === template.id && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        <Button onClick={handleSubmit} disabled={!selectedTemplate} className="mt-4">
          Create Dataset
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDatasetDialog;
