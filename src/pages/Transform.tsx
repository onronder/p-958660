
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTransformations } from "@/hooks/useTransformations";
import { Transformation } from "@/types/transformation";
import TransformationModal from "@/components/transformations/TransformationModal";
import TransformationList from "@/components/transformations/TransformationList";
import DeleteTransformationDialog from "@/components/transformations/DeleteTransformationDialog";
import TransformationHeader from "@/components/transformations/TransformationHeader";

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
      <TransformationHeader onAddNew={handleAddNew} />

      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Saved Transformations</h3>
          
          <TransformationList 
            transformations={transformations}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onApply={handleApply}
            onToggleStatus={handleToggleStatus}
            onAddNew={handleAddNew}
          />
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

      <DeleteTransformationDialog 
        open={!!transformationToDelete} 
        onOpenChange={(open) => !open && setTransformationToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Transform;
