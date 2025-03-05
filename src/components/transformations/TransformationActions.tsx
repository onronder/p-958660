
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TransformationActionsProps {
  isLoading: boolean;
  name: string;
  sourceId: string;
  skipTransformation: boolean;
  isEditMode: boolean;
  onCancel: () => void;
  onSave: () => void;
}

const TransformationActions: React.FC<TransformationActionsProps> = ({
  isLoading,
  name,
  sourceId,
  skipTransformation,
  isEditMode,
  onCancel,
  onSave
}) => {
  return (
    <div className="flex justify-between space-x-2">
      <Button variant="outline" onClick={onCancel} disabled={isLoading}>
        Cancel
      </Button>
      {skipTransformation && (
        <Button onClick={onSave} disabled={isLoading || !name || !sourceId}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            isEditMode ? "Update Transformation" : "Save Transformation"
          )}
        </Button>
      )}
    </div>
  );
};

export default TransformationActions;
