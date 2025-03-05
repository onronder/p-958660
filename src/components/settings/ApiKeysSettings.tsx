
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Plus, RefreshCw, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Type definitions
interface ApiKey {
  id: string;
  key: string;
  created: string;
  expires: string | null;
}

interface Webhook {
  id: string;
  url: string;
  eventType: string;
  created: string;
}

const ApiKeysSettings = () => {
  const { toast } = useToast();
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      key: "ft_k_5f7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x",
      created: "2023-10-15",
      expires: "2024-10-15",
    },
  ]);
  
  // Webhooks state
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: "1",
      url: "https://example.com/webhook",
      eventType: "Job Completed",
      created: "2023-10-10",
    },
  ]);
  
  // New webhook state
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookEvent, setNewWebhookEvent] = useState("Job Completed");
  const [isAddingWebhook, setIsAddingWebhook] = useState(false);
  
  // Copy API key to clipboard
  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "API key copied",
      description: "API key has been copied to your clipboard.",
    });
  };
  
  // Generate new API key
  const generateApiKey = () => {
    const newKey = {
      id: Math.random().toString(36).substring(2, 11),
      key: `ft_k_${Math.random().toString(36).substring(2, 30)}`,
      created: new Date().toISOString().split("T")[0],
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };
    
    setApiKeys([...apiKeys, newKey]);
    
    toast({
      title: "New API key generated",
      description: "Your new API key has been generated successfully.",
    });
  };
  
  // Delete API key
  const deleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    
    toast({
      title: "API key deleted",
      description: "The API key has been deleted successfully.",
    });
  };
  
  // Add new webhook
  const addWebhook = () => {
    if (!newWebhookUrl) {
      toast({
        title: "Missing webhook URL",
        description: "Please enter a webhook URL.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAddingWebhook(true);
    
    // Simulate adding a webhook
    setTimeout(() => {
      const newWebhook = {
        id: Math.random().toString(36).substring(2, 11),
        url: newWebhookUrl,
        eventType: newWebhookEvent,
        created: new Date().toISOString().split("T")[0],
      };
      
      setWebhooks([...webhooks, newWebhook]);
      setNewWebhookUrl("");
      setNewWebhookEvent("Job Completed");
      setIsAddingWebhook(false);
      
      toast({
        title: "Webhook added",
        description: "Your webhook has been added successfully.",
      });
    }, 1000);
  };
  
  // Delete webhook
  const deleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter(webhook => webhook.id !== id));
    
    toast({
      title: "Webhook deleted",
      description: "The webhook has been deleted successfully.",
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage API keys for integrating with external systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertDescription>
              API keys provide full access to your account. Keep them secure and never share them in public repositories or client-side code.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={generateApiKey}>
                <Plus className="mr-2 h-4 w-4" />
                Generate New API Key
              </Button>
            </div>
            
            {apiKeys.length === 0 ? (
              <div className="text-center p-6 border border-dashed rounded-md">
                <p className="text-muted-foreground">No API keys found. Generate a new key to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map(key => (
                  <div 
                    key={key.id} 
                    className="p-4 border border-border rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-grow">
                      <div className="flex items-center">
                        <p className="font-mono bg-muted px-2 py-1 rounded text-sm truncate max-w-[240px] sm:max-w-md">
                          {key.key}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-2"
                          onClick={() => copyApiKey(key.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created: {key.created} 
                        {key.expires && ` • Expires: ${key.expires}`}
                      </p>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-destructive border-destructive hover:bg-destructive/10"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm API Key Deletion</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this API key? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button 
                            variant="destructive"
                            onClick={() => deleteApiKey(key.id)}
                          >
                            Delete API Key
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
          <CardDescription>
            Configure webhooks to notify external systems about events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://example.com/webhook"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Select 
                  value={newWebhookEvent} 
                  onValueChange={setNewWebhookEvent}
                >
                  <SelectTrigger id="eventType">
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Job Completed">Job Completed</SelectItem>
                    <SelectItem value="Job Failed">Job Failed</SelectItem>
                    <SelectItem value="Data Updated">Data Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={addWebhook}
                disabled={isAddingWebhook || !newWebhookUrl}
              >
                {isAddingWebhook ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Webhook
                  </>
                )}
              </Button>
            </div>
            
            {webhooks.length === 0 ? (
              <div className="text-center p-6 border border-dashed rounded-md">
                <p className="text-muted-foreground">No webhooks configured. Add a webhook to get started.</p>
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                {webhooks.map(webhook => (
                  <div 
                    key={webhook.id} 
                    className="p-4 border border-border rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-grow">
                      <p className="font-medium truncate max-w-md">{webhook.url}</p>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {webhook.eventType}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Created: {webhook.created}
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-destructive border-destructive hover:bg-destructive/10"
                      onClick={() => deleteWebhook(webhook.id)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeysSettings;
