
import { useAuth } from "@/contexts/AuthContext";
import { useTransformationState } from "./useTransformationState";
import { useLoadTransformations } from "./useLoadTransformations";
import { useTransformationActions } from "./useTransformationActions";
import { useApplyTransformation } from "./useApplyTransformation";

export const useTransformations = () => {
  const { user } = useAuth();
  const { transformations, setTransformations, isLoading, setIsLoading } = useTransformationState();
  const { loadTransformations } = useLoadTransformations(setTransformations, setIsLoading);
  const { saveTransformation, deleteTransformation, toggleTransformationStatus } = 
    useTransformationActions(transformations, setTransformations);
  const { applyTransformation } = useApplyTransformation();

  return {
    transformations,
    isLoading,
    loadTransformations,
    saveTransformation,
    deleteTransformation,
    toggleTransformationStatus,
    applyTransformation
  };
};
