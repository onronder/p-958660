
import React from "react";
import { Source } from "@/types/source";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { formatDate } from "@/services/sourcesService";

interface DeletedSourcesListProps {
  deletedSources: Source[];
  isLoading: boolean;
  isRestoring: boolean;
  onRestoreSource: (sourceId: string) => Promise<void>;
  error: Error | null;
  onRetry: () => void;
}

const DeletedSourcesList: React.FC<DeletedSourcesListProps> = ({
  deletedSources,
  isLoading,
  isRestoring,
  onRestoreSource,
  error,
  onRetry
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Loading deleted sources...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
        <p className="text-muted-foreground mb-4">Failed to load deleted sources</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (deletedSources.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-muted-foreground">No deleted sources found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deletedSources.map(source => (
        <Card key={source.id} className="p-4 flex items-center justify-between">
          <div>
            <h4 className="font-medium">{source.name}</h4>
            <p className="text-sm text-muted-foreground">
              Deleted: {formatDate(source.deletion_marked_at)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRestoreSource(source.id)}
            disabled={isRestoring}
          >
            {isRestoring ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Restoring...
              </>
            ) : (
              "Restore"
            )}
          </Button>
        </Card>
      ))}
    </div>
  );
};

export default DeletedSourcesList;
