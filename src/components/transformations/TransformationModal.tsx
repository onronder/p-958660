
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useSources } from "@/hooks/useSources";
import { Transformation, TransformationField, FunctionCategory, TransformationFunction } from "@/types/transformation";
import { functionCategories, mockFields } from "@/utils/transformationUtils";
import FieldSelectionStep from "./FieldSelectionStep";
import TransformationStep from "./TransformationStep";
import PreviewStep from "./PreviewStep";
import SkipTransformationInfo from "./SkipTransformationInfo";

interface TransformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  transformation?: Transformation;
  onSave: (transformation: Transformation) => void;
}

const TransformationModal: React.FC<TransformationModalProps> = ({
  isOpen,
  onClose,
  transformation,
  onSave
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { sources } = useSources();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("fields");
  const [selectedFunction, setSelectedFunction] = useState<FunctionCategory>("Arithmetic");
  
  const [name, setName] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [fields, setFields] = useState<TransformationField[]>([]);
  const [derivedColumns, setDerivedColumns] = useState<{name: string, expression: string}[]>([
    { name: "", expression: "" }
  ]);
  const [skipTransformation, setSkipTransformation] = useState(false);
  const [expressionError, setExpressionError] = useState("");
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (transformation) {
      setName(transformation.name);
      setSourceId(transformation.source_id);
      fetchFields(transformation.source_id);
      setSkipTransformation(transformation.skip_transformation || false);
      
      if (transformation.expression) {
        setDerivedColumns([{ name: "derived_column", expression: transformation.expression }]);
      }
    }
  }, [transformation]);

  const fetchFields = async (sourceId: string) => {
    if (!sourceId) return;
    
    try {
      setIsLoading(true);
      const fetchedFields = mockFields(sourceId);
      setFields(fetchedFields);
    } catch (error) {
      console.error("Error fetching fields:", error);
      toast({
        title: "Error",
        description: "Failed to load source fields. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSourceChange = (sourceId: string) => {
    setSourceId(sourceId);
    fetchFields(sourceId);
  };

  const toggleFieldSelection = (fieldId: string) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, selected: !field.selected } : field
    ));
  };

  const updateFieldAlias = (fieldId: string, alias: string) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, alias } : field
    ));
  };

  const addDerivedColumn = () => {
    setDerivedColumns([...derivedColumns, { name: "", expression: "" }]);
  };

  const removeDerivedColumn = (index: number) => {
    setDerivedColumns(derivedColumns.filter((_, i) => i !== index));
  };

  const updateDerivedColumn = (index: number, field: string, value: string) => {
    setDerivedColumns(derivedColumns.map((col, i) => 
      i === index ? { ...col, [field]: value } : col
    ));
  };

  const insertFunctionToExpression = (func: TransformationFunction, index: number) => {
    const currentExpression = derivedColumns[index].expression;
    const updatedExpression = currentExpression + func.name + "()";
    updateDerivedColumn(index, "expression", updatedExpression);
  };

  const validateExpressions = (): boolean => {
    if (skipTransformation) return true;
    
    const hasSelectedFields = fields.some(field => field.selected);
    if (!hasSelectedFields) {
      toast({
        title: "Validation Error",
        description: "Please select at least one field.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!skipTransformation && derivedColumns.length > 0) {
      const hasEmptyDerivedColumn = derivedColumns.some(
        col => !col.name.trim() || !col.expression.trim()
      );
      
      if (hasEmptyDerivedColumn) {
        setExpressionError("Derived column name and expression are required.");
        return false;
      }
    }
    
    return true;
  };

  const generatePreview = async () => {
    if (!validateExpressions()) return;
    
    try {
      setIsLoading(true);
      
      const mockPreviewData = [
        { order_id: "1001", total_price: 99.99, derived_price: 119.99 },
        { order_id: "1002", total_price: 149.99, derived_price: 179.99 },
        { order_id: "1003", total_price: 199.99, derived_price: 239.99 },
      ];
      
      setPreviewData(mockPreviewData);
      setShowPreview(true);
      setActiveTab("preview");
    } catch (error) {
      console.error("Error generating preview:", error);
      toast({
        title: "Error",
        description: "Failed to generate preview. Please check your expressions.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validateExpressions()) return;
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save transformations.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const selectedSource = sources.find(s => s.id === sourceId);
      
      const newTransformation: Transformation = {
        id: transformation?.id || crypto.randomUUID(),
        name,
        source_id: sourceId,
        source_name: selectedSource?.name || "Unknown Source",
        status: "Active",
        last_modified: new Date().toISOString().split('T')[0],
        user_id: user.id,
        skip_transformation: skipTransformation,
        expression: skipTransformation ? undefined : derivedColumns.map(col => col.expression).join(';')
      };
      
      onSave(newTransformation);
      
      toast({
        title: "Success",
        description: `Transformation ${transformation ? "updated" : "created"} successfully.`,
      });
      
      onClose();
    } catch (error) {
      console.error("Error saving transformation:", error);
      toast({
        title: "Error",
        description: "Failed to save transformation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transformation ? "Edit Transformation" : "Create New Transformation"}
          </DialogTitle>
          <DialogDescription>
            Configure your data transformation settings below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Transformation Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name for this transformation"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="source">Data Source</Label>
              <Select 
                value={sourceId} 
                onValueChange={handleSourceChange}
                disabled={!!transformation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a data source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="skipTransformation"
                checked={skipTransformation}
                onCheckedChange={(checked) => {
                  setSkipTransformation(checked as boolean);
                  if (checked) {
                    setActiveTab("review");
                  }
                }}
              />
              <label
                htmlFor="skipTransformation"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Skip Transformation (Export Raw Data)
              </label>
            </div>
          </div>
          
          {!skipTransformation && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="fields">Fields</TabsTrigger>
                <TabsTrigger value="transformations">Transformations</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="fields">
                <FieldSelectionStep
                  fields={fields}
                  isLoading={isLoading}
                  onToggleField={toggleFieldSelection}
                  onUpdateAlias={updateFieldAlias}
                  onNext={() => setActiveTab("transformations")}
                />
              </TabsContent>
              
              <TabsContent value="transformations">
                <TransformationStep
                  derivedColumns={derivedColumns}
                  expressionError={expressionError}
                  selectedFunction={selectedFunction}
                  functionCategories={functionCategories}
                  onSelectFunction={setSelectedFunction}
                  onUpdateDerivedColumn={updateDerivedColumn}
                  onAddDerivedColumn={addDerivedColumn}
                  onRemoveDerivedColumn={removeDerivedColumn}
                  onInsertFunction={insertFunctionToExpression}
                  onBack={() => setActiveTab("fields")}
                  onGeneratePreview={generatePreview}
                />
              </TabsContent>
              
              <TabsContent value="preview">
                <PreviewStep
                  isLoading={isLoading}
                  showPreview={showPreview}
                  previewData={previewData}
                  onGeneratePreview={generatePreview}
                  onBack={() => setActiveTab("transformations")}
                  onSave={handleSave}
                  isExistingTransformation={!!transformation}
                />
              </TabsContent>
            </Tabs>
          )}
          
          {skipTransformation && <SkipTransformationInfo />}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          {skipTransformation && (
            <Button onClick={handleSave} disabled={isLoading || !name || !sourceId}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                transformation ? "Update Transformation" : "Save Transformation"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransformationModal;
