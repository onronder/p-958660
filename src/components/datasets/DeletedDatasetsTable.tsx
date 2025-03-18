
import React from 'react';
import { Dataset } from '@/types/dataset';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash, RefreshCw } from 'lucide-react';
import DatasetStatusBadge from './DatasetStatusBadge';
import { format, formatDistanceToNow, isValid } from 'date-fns';

export interface DeletedDatasetsTableProps {
  deletedDatasets: Dataset[];
  isRestoring: boolean;
  isDeleting: boolean;
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
  // Helper function to format deletion date and time remaining
  const getExpirationInfo = (dataset: Dataset) => {
    if (!dataset.deletion_marked_at) return "Unknown deletion date";
    
    const deletionDate = new Date(dataset.deletion_marked_at);
    if (!isValid(deletionDate)) return "Unknown deletion date";
    
    // Calculate expiration date (30 days from deletion)
    const expirationDate = new Date(deletionDate);
    expirationDate.setDate(expirationDate.getDate() + 30);
    
    // Format as "Will be permanently deleted in X days (on DATE)"
    const timeRemaining = formatDistanceToNow(expirationDate, { addSuffix: true });
    const formattedDate = format(expirationDate, 'MMM d, yyyy');
    
    return `Will be permanently deleted ${timeRemaining} (${formattedDate})`;
  };

  return (
    <Card>
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">Deleted Datasets</h3>
        <p className="text-sm text-muted-foreground">
          Datasets are kept in trash for 30 days before being permanently deleted
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Deleted At</TableHead>
            <TableHead>Expiration</TableHead>
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
              <TableCell>
                {dataset.deletion_marked_at 
                  ? format(new Date(dataset.deletion_marked_at), 'MMM d, yyyy')
                  : "Unknown"}
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {getExpirationInfo(dataset)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRestore(dataset.id, dataset.name)}
                  disabled={isRestoring}
                  className="mr-2"
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
                      Delete Permanently
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
