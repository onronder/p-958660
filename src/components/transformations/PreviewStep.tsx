
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PreviewStepProps {
  isLoading: boolean;
  showPreview: boolean;
  previewData: any[];
  onGeneratePreview: () => void;
  onBack: () => void;
  onSave: () => void;
  isExistingTransformation: boolean;
}

const PreviewStep = ({
  isLoading,
  showPreview,
  previewData,
  onGeneratePreview,
  onBack,
  onSave,
  isExistingTransformation,
}: PreviewStepProps) => {
  return (
    <div className="space-y-4 mt-4">
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
          <Button onClick={onGeneratePreview}>Generate Preview</Button>
        </div>
      )}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back: Define Transformations
        </Button>
        <Button onClick={onSave}>
          {isExistingTransformation ? "Update Transformation" : "Save Transformation"}
        </Button>
      </div>
    </div>
  );
};

export default PreviewStep;
