
import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dataset } from "@/types/dataset";
import DatasetTableRow from "./DatasetTableRow";

interface DatasetsTableProps {
  datasets: Dataset[];
  onRunDataset: (dataset: Dataset) => Promise<void>;
  onDeleteDataset: (datasetId: string, datasetName: string) => Promise<void>;
}

const DatasetsTable = ({ datasets, onRunDataset, onDeleteDataset }: DatasetsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Last Run</TableHead>
          <TableHead>Records</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {datasets.map((dataset) => (
          <DatasetTableRow
            key={dataset.id}
            dataset={dataset}
            onRunDataset={onRunDataset}
            onDelete={onDeleteDataset}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default DatasetsTable;
