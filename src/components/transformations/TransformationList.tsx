
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Edit, Trash, Play } from "lucide-react";
import { Transformation } from "@/types/transformation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface TransformationListProps {
  transformations: Transformation[];
  isLoading: boolean;
  onEdit: (transformation: Transformation) => void;
  onDelete: (transformationId: string) => void;
  onApply: (transformationId: string) => void;
  onToggleStatus: (transformationId: string) => void;
  onAddNew: () => void;
}

const TransformationList: React.FC<TransformationListProps> = ({
  transformations,
  isLoading,
  onEdit,
  onDelete,
  onApply,
  onToggleStatus,
  onAddNew
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-8 w-[120px]" />
          </div>
        ))}
      </div>
    );
  }

  if (transformations.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">No transformations found</h3>
        <p className="text-muted-foreground mt-1">Create your first transformation to get started</p>
        <Button className="mt-4" onClick={onAddNew}>
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Transformation
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Last Modified</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transformations.map((transformation) => (
          <TableRow key={transformation.id}>
            <TableCell className="font-medium">
              <div className="flex items-center">
                {transformation.name}
                {transformation.skip_transformation && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="ml-2 bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded-sm">
                          Raw
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Skips transformation and exports raw data</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </TableCell>
            <TableCell>{transformation.source_name}</TableCell>
            <TableCell>{transformation.last_modified}</TableCell>
            <TableCell>
              <button
                onClick={() => onToggleStatus(transformation.id)}
                className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
                  transformation.status === "Active" 
                    ? "bg-green-100 text-green-800 hover:bg-green-200" 
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {transformation.status}
              </button>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2"
                  onClick={() => onEdit(transformation)}
                >
                  <Edit className="h-4 w-4" />
                  <span className="ml-1">Edit</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-red-500 hover:text-red-600"
                  onClick={() => onDelete(transformation.id)}
                >
                  <Trash className="h-4 w-4" />
                  <span className="ml-1">Delete</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-blue-500 hover:text-blue-600"
                  onClick={() => onApply(transformation.id)}
                >
                  <Play className="h-4 w-4" />
                  <span className="ml-1">Apply</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TransformationList;
