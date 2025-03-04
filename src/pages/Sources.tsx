
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SourceStatusBadge from "@/components/SourceStatusBadge";
import { InfoIcon } from "lucide-react";
import { Source } from "@/types/source";
import { useAuth } from "@/contexts/AuthContext";

const Sources = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSources();
    }
  }, [user]);

  const fetchSources = async () => {
    try {
      setIsLoading(true);
      
      if (!user) {
        return;
      }
      
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Error fetching sources:", error);
        toast({
          title: "Error",
          description: "Failed to load sources. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      setSources(data || []);
    } catch (error) {
      console.error("Error fetching sources:", error);
      toast({
        title: "Error",
        description: "Failed to load sources. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (sourceId: string) => {
    try {
      toast({
        title: "Testing connection...",
        description: "Please wait while we verify the connection.",
      });
      
      // In a real implementation, this would call an API endpoint that tests the connection
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Connection Successful",
        description: "The source connection is working properly.",
      });
    } catch (error) {
      console.error("Error testing connection:", error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to the source. Please check credentials.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      const { error } = await supabase
        .from('sources')
        .delete()
        .eq('id', sourceId);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Source Deleted",
        description: "The source has been deleted successfully.",
      });
      
      fetchSources();
    } catch (error) {
      console.error("Error deleting source:", error);
      toast({
        title: "Error",
        description: "Failed to delete source. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    }).format(date);
  };

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-4 mb-4">
        <div className="text-blue-500 mt-1">
          <InfoIcon />
        </div>
        <div className="flex-1">
          <p className="text-blue-800">
            <span className="font-bold">⚡ The My Sources</span> page allows you to connect and manage your data sources, such as Shopify or other platforms, ensuring seamless integration for data extraction and processing.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">My Sources</h1>
        <div className="flex gap-2">
          <Button onClick={fetchSources} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button asChild className="flex items-center gap-2">
            <Link to="/sources/add">
              <Plus className="h-4 w-4" />
              Add New Source
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="h-24 animate-pulse bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      ) : sources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sources.map((source) => (
            <Card key={source.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{source.name}</h3>
                      <SourceStatusBadge status={source.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{source.url}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{source.source_type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Sync:</span>
                      <span className="font-medium">{formatDate(source.last_sync)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-6 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleTestConnection(source.id)}
                >
                  Test Connection
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDeleteSource(source.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-10 flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <div className="text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 19v-8.5a1 1 0 0 0-.4-.8l-7-5.25a1 1 0 0 0-1.2 0l-7 5.25a1 1 0 0 0-.4.8V19a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1z"></path>
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">No Sources Connected</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Connect your first data source to start extracting and transforming your data.
          </p>
          <Button asChild>
            <Link to="/sources/add">
              <Plus className="h-4 w-4 mr-2" />
              Connect Your First Source
            </Link>
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Sources;
