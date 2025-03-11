
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArchiveRestore, AlertCircle } from "lucide-react";
import { Source } from "@/types/source";
import { formatDate } from "@/services/sourcesService";
import SourcesLoadingSkeleton from "@/components/SourcesLoadingSkeleton";

interface DeletedSourcesListProps {
  deletedSources: Source[];
  isLoading: boolean;
  isRestoring: boolean;
  onRestoreSource: (sourceId: string) => void;
}

const DeletedSourcesList: React.FC<DeletedSourcesListProps> = ({
  deletedSources,
  isLoading,
  isRestoring,
  onRestoreSource
}) => {
  if (isLoading) {
    return <SourcesLoadingSkeleton />;
  }

  if (deletedSources.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center justify-center p-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No Deleted Sources</h3>
          <p className="text-muted-foreground">
            There are no sources in the trash. Deleted sources will appear here for 30 days before being permanently removed.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {deletedSources.map((source) => (
        <Card key={source.id} className="p-6">
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{source.name}</h3>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Deleted
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{source.url}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{source.source_type}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Deleted On:</span>
                <span className="font-medium">{formatDate(source.deletion_marked_at)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-border">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              disabled={isRestoring}
              onClick={() => onRestoreSource(source.id)}
            >
              <ArchiveRestore className="h-4 w-4 mr-2" />
              Restore Source
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DeletedSourcesList;
