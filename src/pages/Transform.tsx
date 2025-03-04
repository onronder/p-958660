
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus, Edit, Trash, Play, Info } from "lucide-react";
import { useTransformations } from "@/hooks/useTransformations";
import TransformationModal from "@/components/transformations/TransformationModal";
import { Transformation } from "@/types/transformation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

const Transform = () => {
  const { 
    transformations, 
    isLoading, 
    saveTransformation, 
    deleteTransformation,
    toggleTransformationStatus,
    applyTransformation 
  } = useTransformations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransformation, setCurrentTransformation] = useState<Transformation | undefined>(undefined);
  const [transformationToDelete, setTransformationToDelete] = useState<string | null>(null);

  const handleAddNew = () => {
    setCurrentTransformation(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (transformation: Transformation) => {
    setCurrentTransformation(transformation);
    setIsModalOpen(true);
  };

  const handleDelete = (transformationId: string) => {
    setTransformationToDelete(transformationId);
  };

  const confirmDelete = async () => {
    if (transformationToDelete) {
      await deleteTransformation(transformationToDelete);
      setTransformationToDelete(null);
    }
  };

  const handleSave = async (transformation: Transformation) => {
    await saveTransformation(transformation);
  };

  const handleApply = async (transformationId: string) => {
    await applyTransformation(transformationId);
  };

  const handleToggleStatus = async (transformationId: string) => {
    await toggleTransformationStatus(transformationId);
  };

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-4 mb-4">
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
        <Button className="flex items-center gap-2" onClick={handleAddNew}>
          <Plus className="h-4 w-4" />
          Add New Transformation
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Saved Transformations</h3>
          
          {isLoading ? (
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
          ) : transformations.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium">No transformations found</h3>
              <p className="text-muted-foreground mt-1">Create your first transformation to get started</p>
              <Button className="mt-4" onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Transformation
              </Button>
            </div>
          ) : (
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
                        onClick={() => handleToggleStatus(transformation.id)}
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
                          onClick={() => handleEdit(transformation)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="ml-1">Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(transformation.id)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="ml-1">Delete</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-blue-500 hover:text-blue-600"
                          onClick={() => handleApply(transformation.id)}
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
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <TransformationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          transformation={currentTransformation}
          onSave={handleSave}
        />
      )}

      <AlertDialog open={!!transformationToDelete} onOpenChange={(open) => !open && setTransformationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this transformation and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Transform;
