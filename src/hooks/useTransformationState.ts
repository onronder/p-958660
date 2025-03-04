
import { useState } from "react";
import { Transformation } from "@/types/transformation";

export const useTransformationState = () => {
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  return {
    transformations,
    setTransformations,
    isLoading,
    setIsLoading
  };
};
