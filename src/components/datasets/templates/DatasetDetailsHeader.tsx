
import React from "react";

interface DatasetDetailsHeaderProps {
  datasetType: "predefined" | "dependent" | "custom";
}

const DatasetDetailsHeader: React.FC<DatasetDetailsHeaderProps> = ({ datasetType }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold">Dataset Details</h2>
      <p className="text-muted-foreground mt-1">
        {datasetType === "predefined" && "Choose a pre-built dataset template to extract data."}
        {datasetType === "dependent" && "These templates combine multiple related data types."}
        {datasetType === "custom" && "Create your own custom query to extract data."}
      </p>
    </div>
  );
};

export default DatasetDetailsHeader;
