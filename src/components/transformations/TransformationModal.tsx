
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
import { supabase } from "@/integrations/supabase/client";
import { useSources } from "@/hooks/useSources";
import { Source } from "@/types/source";
import { 
  Transformation, 
  TransformationField, 
  FieldCategory,
  FunctionCategory,
  TransformationFunction
} from "@/types/transformation";
import { Loader2, X } from "lucide-react";

interface TransformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  transformation?: Transformation;
  onSave: (transformation: Transformation) => void;
}

const functionCategories: Record<FunctionCategory, TransformationFunction[]> = {
  "Arithmetic": [
    { 
      name: "SUM", 
      category: "Arithmetic", 
      description: "Adds values together", 
      syntax: "SUM(value1, value2, ...)", 
      example: "SUM(price, tax)" 
    },
    { 
      name: "AVERAGE", 
      category: "Arithmetic", 
      description: "Calculates the average of values", 
      syntax: "AVERAGE(value1, value2, ...)", 
      example: "AVERAGE(daily_sales)" 
    },
    { 
      name: "MULTIPLY", 
      category: "Arithmetic", 
      description: "Multiplies values", 
      syntax: "MULTIPLY(value1, value2)", 
      example: "MULTIPLY(quantity, price)" 
    },
    { 
      name: "DIVIDE", 
      category: "Arithmetic", 
      description: "Divides values", 
      syntax: "DIVIDE(value1, value2)", 
      example: "DIVIDE(total, count)" 
    }
  ],
  "Logical": [
    { 
      name: "IF", 
      category: "Logical", 
      description: "Conditional logic", 
      syntax: "IF(condition, true_value, false_value)", 
      example: "IF(total > 100, 'High', 'Low')" 
    },
    { 
      name: "CASE", 
      category: "Logical", 
      description: "Multiple conditional logic", 
      syntax: "CASE(value, case1, result1, ...)", 
      example: "CASE(status, 'paid', 'Complete', 'Pending')" 
    },
    { 
      name: "COALESCE", 
      category: "Logical", 
      description: "Returns first non-null value", 
      syntax: "COALESCE(value1, value2, ...)", 
      example: "COALESCE(shipping_address, billing_address)" 
    }
  ],
  "Text": [
    { 
      name: "CONCAT", 
      category: "Text", 
      description: "Combines text strings", 
      syntax: "CONCAT(text1, text2, ...)", 
      example: "CONCAT(first_name, ' ', last_name)" 
    },
    { 
      name: "UPPER", 
      category: "Text", 
      description: "Converts text to uppercase", 
      syntax: "UPPER(text)", 
      example: "UPPER(email)" 
    },
    { 
      name: "LOWER", 
      category: "Text", 
      description: "Converts text to lowercase", 
      syntax: "LOWER(text)", 
      example: "LOWER(product_code)" 
    }
  ],
  "Date": [
    { 
      name: "DATEDIFF", 
      category: "Date", 
      description: "Calculates difference between dates", 
      syntax: "DATEDIFF(date1, date2)", 
      example: "DATEDIFF(order_date, ship_date)" 
    },
    { 
      name: "TIMESTAMPDIFF", 
      category: "Date", 
      description: "Calculates difference between timestamps", 
      syntax: "TIMESTAMPDIFF(timestamp1, timestamp2)", 
      example: "TIMESTAMPDIFF(created_at, updated_at)" 
    }
  ]
};

// Mock data for fields, in real implementation this would come from the API
const mockFields = (sourceId: string): TransformationField[] => {
  // In a real implementation, fetch fields from the API based on source ID
  return [
    { id: "1", name: "order_id", category: "Orders", selected: false },
    { id: "2", name: "customer_id", category: "Orders", selected: false },
    { id: "3", name: "total_price", category: "Orders", selected: false },
    { id: "4", name: "created_at", category: "Orders", selected: false },
    { id: "5", name: "first_name", category: "Customers", selected: false },
    { id: "6", name: "last_name", category: "Customers", selected: false },
    { id: "7", name: "email", category: "Customers", selected: false },
    { id: "8", name: "product_id", category: "Products", selected: false },
    { id: "9", name: "product_name", category: "Products", selected: false },
    { id: "10", name: "sku", category: "Products", selected: false },
    { id: "11", name: "price", category: "Products", selected: false }
  ];
};

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
  
  // Form state
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

  // Initialize form with existing transformation data if editing
  useEffect(() => {
    if (transformation) {
      setName(transformation.name);
      setSourceId(transformation.source_id);
      // In a real implementation, we would fetch the fields and their selection state
      fetchFields(transformation.source_id);
      setSkipTransformation(transformation.skip_transformation || false);
      
      // In a real implementation, we would fetch the expression and parse it into derived columns
      if (transformation.expression) {
        setDerivedColumns([{ name: "derived_column", expression: transformation.expression }]);
      }
    }
  }, [transformation]);

  const fetchFields = async (sourceId: string) => {
    if (!sourceId) return;
    
    try {
      setIsLoading(true);
      // In a real implementation, we would fetch fields from the API
      // const { data, error } = await supabase.functions.invoke("get-source-fields", {
      //   body: { source_id: sourceId }
      // });
      
      // if (error) throw error;
      
      // For now, we'll use mock data
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
    // Skip validation if transformation is skipped
    if (skipTransformation) return true;
    
    // Check if at least one field is selected
    const hasSelectedFields = fields.some(field => field.selected);
    if (!hasSelectedFields) {
      toast({
        title: "Validation Error",
        description: "Please select at least one field.",
        variant: "destructive",
      });
      return false;
    }
    
    // Check derived columns if not skipping transformations
    if (!skipTransformation && derivedColumns.length > 0) {
      // Check if any derived column is empty
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
      
      // In a real implementation, we would call the API to get a preview
      // const { data, error } = await supabase.functions.invoke("transformation-preview", {
      //   body: { 
      //     source_id: sourceId,
      //     fields: fields.filter(f => f.selected),
      //     derived_columns: skipTransformation ? [] : derivedColumns,
      //   }
      // });
      
      // if (error) throw error;
      
      // For now, we'll use mock data
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
        skip_transformation,
        // In a real implementation, we would build the expression properly
        expression: skipTransformation ? undefined : derivedColumns.map(col => col.expression).join(';')
      };
      
      // In a real implementation, we would call the API to save the transformation
      // const { data, error } = await supabase.from('transformations').upsert(newTransformation);
      // if (error) throw error;
      
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

  // Group fields by category
  const fieldsByCategory = fields.reduce<Record<string, TransformationField[]>>((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {});

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
              
              <TabsContent value="fields" className="space-y-4 mt-4">
                <h3 className="text-lg font-medium">Select Fields</h3>
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  Object.entries(fieldsByCategory).map(([category, categoryFields]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm">{category}</h4>
                      <div className="border rounded-md p-4 space-y-3">
                        {categoryFields.map((field) => (
                          <div key={field.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={`field-${field.id}`}
                              checked={field.selected}
                              onCheckedChange={() => toggleFieldSelection(field.id)}
                            />
                            <label
                              htmlFor={`field-${field.id}`}
                              className="text-sm font-medium leading-none flex-1"
                            >
                              {field.name}
                            </label>
                            {field.selected && (
                              <div className="flex items-center space-x-2">
                                <Label htmlFor={`alias-${field.id}`} className="text-xs">Alias:</Label>
                                <Input
                                  id={`alias-${field.id}`}
                                  className="h-8 w-32 text-xs"
                                  value={field.alias || ""}
                                  onChange={(e) => updateFieldAlias(field.id, e.target.value)}
                                  placeholder="Rename field"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
                <div className="flex justify-end">
                  <Button onClick={() => setActiveTab("transformations")}>
                    Next: Define Transformations
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="transformations" className="space-y-4 mt-4">
                <h3 className="text-lg font-medium">Define Derived Columns</h3>
                <div className="space-y-4">
                  {derivedColumns.map((column, index) => (
                    <div key={index} className="border rounded-md p-4 space-y-3 relative">
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => removeDerivedColumn(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor={`column-name-${index}`}>Column Name</Label>
                        <Input
                          id={`column-name-${index}`}
                          value={column.name}
                          onChange={(e) => updateDerivedColumn(index, "name", e.target.value)}
                          placeholder="e.g., tax_adjusted_price"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`column-expression-${index}`}>Expression</Label>
                        <div className="grid grid-cols-1 gap-2">
                          <Input
                            id={`column-expression-${index}`}
                            value={column.expression}
                            onChange={(e) => updateDerivedColumn(index, "expression", e.target.value)}
                            placeholder="e.g., total_price * 1.2"
                          />
                          <div className="space-y-2">
                            <Label>Insert Function</Label>
                            <div className="space-y-2">
                              <Select value={selectedFunction} onValueChange={(value) => setSelectedFunction(value as FunctionCategory)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select function type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.keys(functionCategories).map((category) => (
                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {functionCategories[selectedFunction].map((func) => (
                                  <Button
                                    key={func.name}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => insertFunctionToExpression(func, index)}
                                    title={func.description}
                                  >
                                    {func.name}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                          {expressionError && (
                            <p className="text-sm text-red-500">{expressionError}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={addDerivedColumn}
                    className="w-full"
                  >
                    + Add Another Derived Column
                  </Button>
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setActiveTab("fields")}>
                    Back: Field Selection
                  </Button>
                  <Button onClick={generatePreview}>
                    Generate Preview
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="space-y-4 mt-4">
                <h3 className="text-lg font-medium">Data Preview</h3>
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : showPreview ? (
                  <div className="border rounded-md overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          {previewData.length > 0 && Object.keys(previewData[0]).map((key) => (
                            <th key={key} className="px-4 py-2 text-left font-medium text-muted-foreground">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-t">
                            {Object.values(row).map((value, valueIndex) => (
                              <td key={valueIndex} className="px-4 py-2">
                                {value?.toString()}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 border rounded-md">
                    <p className="text-muted-foreground mb-2">No preview available</p>
                    <Button onClick={generatePreview}>Generate Preview</Button>
                  </div>
                )}
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("transformations")}
                  >
                    Back: Define Transformations
                  </Button>
                  <Button onClick={handleSave}>
                    {transformation ? "Update Transformation" : "Save Transformation"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          {skipTransformation && (
            <div className="pt-4">
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Skip Transformation Selected</h3>
                <p className="text-sm text-muted-foreground">
                  Raw data will be exported directly from the source without any transformations.
                  This is useful when you need the original data format or for performance optimization.
                </p>
              </div>
            </div>
          )}
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
