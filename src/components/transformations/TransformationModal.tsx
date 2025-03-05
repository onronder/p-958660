
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Transformation } from "@/types/transformation";
import FieldSelectionStep from "./FieldSelectionStep";
import TransformationStep from "./TransformationStep";
import PreviewStep from "./PreviewStep";
import SkipTransformationInfo from "./SkipTransformationInfo";
import TransformationBasicInfo from "./TransformationBasicInfo";
import TransformationActions from "./TransformationActions";
import useTransformationValidation from "./useTransformationValidation";
import useTransformationModal from "./useTransformationModal";
import { functionCategories } from "@/utils/transformationUtils";

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
  const { expressionError, setExpressionError, validateExpressions } = useTransformationValidation();
  
  const {
    isLoading,
    activeTab,
    selectedFunction,
    name,
    sourceId,
    fields,
    derivedColumns,
    skipTransformation,
    previewData,
    showPreview,
    sources,
    setActiveTab,
    setSelectedFunction,
    setName,
    setSourceId,
    setSkipTransformation,
    handleSourceChange,
    toggleFieldSelection,
    updateFieldAlias,
    addDerivedColumn,
    removeDerivedColumn,
    updateDerivedColumn,
    insertFunctionToExpression,
    generatePreview,
    handleSave
  } = useTransformationModal({
    transformation,
    onSave,
    onClose
  });

  // Create validator function that has access to the current state
  const validateCurrentState = () => {
    const validator = validateExpressions();
    return validator(skipTransformation, fields, derivedColumns);
  };

  // Function to handle function insertion in the right format
  const handleInsertFunction = (func, index) => {
    insertFunctionToExpression(index, func.syntax || func.name + "()");
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
          <TransformationBasicInfo
            name={name}
            sourceId={sourceId}
            skipTransformation={skipTransformation}
            isEditMode={!!transformation}
            sources={sources}
            onNameChange={setName}
            onSourceChange={handleSourceChange}
            onSkipTransformationChange={setSkipTransformation}
            onActiveTabChange={setActiveTab}
          />
          
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
                  onInsertFunction={handleInsertFunction}
                  onBack={() => setActiveTab("fields")}
                  onGeneratePreview={() => generatePreview(validateCurrentState)}
                />
              </TabsContent>
              
              <TabsContent value="preview">
                <PreviewStep
                  isLoading={isLoading}
                  showPreview={showPreview}
                  previewData={previewData}
                  onGeneratePreview={() => generatePreview(validateCurrentState)}
                  onBack={() => setActiveTab("transformations")}
                  onSave={() => handleSave(validateCurrentState)}
                  isExistingTransformation={!!transformation}
                />
              </TabsContent>
            </Tabs>
          )}
          
          {skipTransformation && <SkipTransformationInfo />}
        </div>
        
        <DialogFooter>
          <TransformationActions
            isLoading={isLoading}
            name={name}
            sourceId={sourceId}
            skipTransformation={skipTransformation}
            isEditMode={!!transformation}
            onCancel={onClose}
            onSave={() => handleSave(validateCurrentState)}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransformationModal;
