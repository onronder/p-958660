
import { Button } from "@/components/ui/button";
import { Plus, Info } from "lucide-react";

interface TransformationHeaderProps {
  onAddNew: () => void;
}

const TransformationHeader: React.FC<TransformationHeaderProps> = ({ onAddNew }) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-4">
        <div className="text-blue-500 mt-1">
          <Info className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-blue-800">
            <span className="font-bold">⚡ The Transformation</span> page enables you to create and manage data transformation rules and operations, ensuring your data is optimized for your specific needs.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Transformations</h1>
        <Button className="flex items-center gap-2" onClick={onAddNew}>
          <Plus className="h-4 w-4" />
          Add New Transformation
        </Button>
      </div>
    </div>
  );
};

export default TransformationHeader;
