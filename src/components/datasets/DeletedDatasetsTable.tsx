import React from 'react';
import { Dataset } from '@/types/dataset';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash, RefreshCw } from 'lucide-react';
import DatasetStatusBadge from './DatasetStatusBadge';

export interface DeletedDatasetsTableProps {
  deletedDatasets: Dataset[];
  isRestoring: boolean; // Add isRestoring prop
  isDeleting: boolean; // Add isDeleting prop
  onRestore: (id: string, name: string) => Promise<boolean>;
  onDelete: (id: string, name: string) => Promise<boolean>;
}

const DeletedDatasetsTable: React.FC<DeletedDatasetsTableProps> = ({
  deletedDatasets,
  isRestoring,
  isDeleting,
  onRestore,
  onDelete
}) => {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deletedDatasets.map((dataset) => (
            <TableRow key={dataset.id}>
              <TableCell className="font-medium">{dataset.name}</TableCell>
              <TableCell>
                <DatasetStatusBadge status={dataset.status} />
              </TableCell>
              <TableCell>{new Date(dataset.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRestore(dataset.id, dataset.name)}
                  disabled={isRestoring}
                >
                  {isRestoring ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    "Restore"
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(dataset.id, dataset.name)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default DeletedDatasetsTable;
