
import { useTransformationsList } from "./transformations/useTransformationsList";
import { useTransformationMutations } from "./transformations/useTransformationMutations";
import { useTransformationStatus } from "./transformations/useTransformationStatus";
import { useTransformationDeletion } from "./transformations/useTransformationDeletion";
import { useTransformationApplication } from "./transformations/useTransformationApplication";
import { Transformation } from "@/types/transformation";

export const useTransformations = () => {
  const { 
    transformations, 
    setTransformations, 
    isLoading, 
    error 
  } = useTransformationsList();
  
  const { saveTransformation } = useTransformationMutations(setTransformations);
  const { toggleTransformationStatus } = useTransformationStatus(transformations, setTransformations);
  const { deleteTransformation } = useTransformationDeletion(setTransformations);
  const { applyTransformation, isApplying } = useTransformationApplication();

  return { 
    transformations, 
    isLoading: isLoading || isApplying, 
    error,
    saveTransformation,
    deleteTransformation,
    toggleTransformationStatus,
    applyTransformation
  };
};
