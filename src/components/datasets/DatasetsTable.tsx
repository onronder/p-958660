import React from 'react';
import { Dataset } from '@/types/dataset';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DatasetStatusBadge from './DatasetStatusBadge';
import DatasetTableRow from './DatasetTableRow';

export interface DatasetsTableProps {
  datasets: Dataset[];
  isLoading?: boolean;
  onDelete?: (datasetId: string, datasetName: string) => Promise<void>;
  onRun?: (datasetId: string) => Promise<void>;
}

const DatasetsTable: React.FC<DatasetsTableProps> = ({ 
  datasets, 
  isLoading = false, 
  onDelete,
  onRun 
}) => {
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
            onRunDataset={onRun}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default DatasetsTable;
