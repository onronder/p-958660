
import React from "react";
import DatasetTypeStep from "@/components/datasets/wizard/DatasetTypeStep";

interface TypeStepProps {
  selectedType: 'predefined' | 'dependent' | 'custom';
  onSelectType: (type: 'predefined' | 'dependent' | 'custom') => void;
  isShopifySource: boolean;
}

const TypeStep: React.FC<TypeStepProps> = ({
  selectedType,
  onSelectType,
  isShopifySource
}) => {
  return (
    <DatasetTypeStep
      selectedType={selectedType}
      onSelectType={onSelectType}
      isShopifySource={isShopifySource}
    />
  );
};

export default TypeStep;
