
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, FileText, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Dataset } from "@/types/dataset";
import { 
  fetchDatasets, 
  fetchDeletedDatasets 
} from "@/services/datasets";
import InfoBanner from "@/components/InfoBanner";
import CreateDatasetDialog from "@/components/datasets/CreateDatasetDialog";
import DatasetsList from "@/components/datasets/DatasetsList";
import DeletedDatasetsTable from "@/components/datasets/DeletedDatasetsTable";
import LoadingState from "@/components/datasets/LoadingState";
import { useDatasetActions } from "@/hooks/useDatasetActions";
import { useSources } from "@/hooks/useSources";

const MyDatasets = () => {
  const navigate = useNavigate();
  const { sources, isLoading: sourcesLoading } = useSources();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [deletedDatasets, setDeletedDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletedLoading, setIsDeletedLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sourcesExist, setSourcesExist] = useState(false);
  
  const { handleRestoreDataset, handlePermanentDelete } = useDatasetActions(loadDatasets);

  useEffect(() => {
    loadDatasets();
    loadDeletedDatasets();
  }, []);
  
  useEffect(() => {
    setSourcesExist(sources.length > 0);
  }, [sources]);

  const loadDatasets = async () => {
    setIsLoading(true);
    try {
      const datasetsData = await fetchDatasets();
      setDatasets(datasetsData);
    } catch (error) {
      console.error("Failed to load datasets:", error);
      toast({
        title: "Error",
        description: "Failed to load datasets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadDeletedDatasets = async () => {
    setIsDeletedLoading(true);
    try {
      const deletedDatasetsData = await fetchDeletedDatasets();
      setDeletedDatasets(deletedDatasetsData);
    } catch (error) {
      console.error("Failed to load deleted datasets:", error);
    } finally {
      setIsDeletedLoading(false);
    }
  };

  const handleDatasetCreated = (newDataset: Dataset) => {
    setDatasets([newDataset, ...datasets]);
  };

  const handleCreateButtonClick = () => {
    if (!sourcesExist) {
      toast({
        title: "No Data Sources",
        description: "You need to connect a data source before creating a dataset.",
        variant: "destructive",
      });
      navigate("/sources");
      return;
    }
    
    setIsDialogOpen(true);
  };

  const sourcesForDialog = sources.map(source => ({
    id: source.id,
    name: source.name
  }));

  return (
    <div className="space-y-8">
      <InfoBanner 
        messageId="datasets-info"
        message={
          <span>
            <span className="font-bold">📊 My Datasets</span> allows you to create, manage, and explore datasets extracted from your connected data sources.
          </span>
        } 
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">My Datasets</h1>
        {sourcesExist ? (
          <CreateDatasetDialog 
            sources={sourcesForDialog}
            onDatasetCreated={handleDatasetCreated}
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        ) : (
          <Button asChild>
            <Link to="/sources" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Connect a Data Source
            </Link>
          </Button>
        )}
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Active Datasets</h3>
        <DatasetsList 
          datasets={datasets}
          isLoading={isLoading || sourcesLoading}
          onDatasetsUpdated={loadDatasets}
          openCreateDialog={handleCreateButtonClick}
          sourcesExist={sourcesExist}
        />
      </Card>
      
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-semibold">Deleted Datasets</h3>
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        
        <p className="text-muted-foreground mb-6">
          Deleted datasets remain for 30 days after which they are permanently deleted.
        </p>
        
        {isDeletedLoading ? (
          <LoadingState />
        ) : (
          <DeletedDatasetsTable 
            deletedDatasets={deletedDatasets}
            onRestoreDataset={handleRestoreDataset}
            onPermanentDelete={handlePermanentDelete}
          />
        )}
      </Card>
    </div>
  );
};

export default MyDatasets;
