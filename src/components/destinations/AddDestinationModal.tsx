import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useDestinations } from "@/hooks/useDestinations";
import { useToast } from "@/hooks/use-toast";

interface AddDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (destination: any) => void;
}

const AddDestinationModal: React.FC<AddDestinationModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [destinationType, setDestinationType] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [exportFormat, setExportFormat] = useState<string>("CSV");
  const [schedule, setSchedule] = useState<string>("Manual");
  const { initiateOAuth, handleOAuthCallback } = useDestinations();
  const { toast } = useToast();
  
  const [credentials, setCredentials] = useState<any>({});
  const [oauthComplete, setOauthComplete] = useState<boolean>(false);
  const [oauthError, setOauthError] = useState<{
    error: string;
    description: string;
    detailedMessage?: string;
  } | null>(null);

  useEffect(() => {
    const handleOAuthRedirect = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      try {
        if (event.data && event.data.type === "oauth_callback") {
          const { provider, code } = event.data;
          
          if (provider && code) {
            const redirectUri = `${window.location.origin}/auth/callback`;
            
            await handleOAuthCallback(
              provider === 'google_drive' ? 'google_drive' : 'onedrive',
              code,
              redirectUri
            );
            
            setOauthComplete(true);
            setOauthError(null);
            
            setCurrentStep(3);
          } else if (event.data && event.data.type === "oauth_error") {
            console.error("OAuth error:", event.data);
            setOauthError({
              error: event.data.error,
              description: event.data.description || "Authentication failed",
              detailedMessage: event.data.detailedMessage
            });
          }
        }
      } catch (error) {
        console.error("Error handling OAuth callback:", error);
        toast({
          title: "Authentication Error",
          description: error instanceof Error ? error.message : "Failed to complete authentication",
          variant: "destructive",
        });
      }
    };

    window.addEventListener('message', handleOAuthRedirect);
    
    return () => {
      window.removeEventListener('message', handleOAuthRedirect);
    };
  }, [handleOAuthCallback, toast]);

  const resetForm = () => {
    setCurrentStep(1);
    setDestinationType("");
    setName("");
    setExportFormat("CSV");
    setSchedule("Manual");
    setCredentials({});
    setOauthComplete(false);
    setOauthError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const storageType = destinationType === 'Google Drive' ? 'google_drive' :
                        destinationType === 'Microsoft OneDrive' ? 'onedrive' :
                        destinationType === 'AWS S3' ? 'aws_s3' :
                        destinationType === 'FTP/SFTP' ? 'ftp_sftp' :
                        'custom_api';
                        
    onAdd({
      name,
      type: destinationType,
      storageType,
      status: "Pending",
      exportFormat,
      schedule,
      lastExport: null,
      credentials
    });
    resetForm();
  };

  const updateCredential = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const handleOAuthLogin = async (provider: 'google_drive' | 'onedrive') => {
    try {
      setOauthError(null);
      const redirectUri = `${window.location.origin}/auth/callback`;
      
      await initiateOAuth(provider, redirectUri);
      
      toast({
        title: "Authorization Required",
        description: `Please authorize with ${provider === 'google_drive' ? 'Google' : 'Microsoft'} in the new window.`,
      });
    } catch (error) {
      console.error("Error initiating OAuth flow:", error);
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Failed to start authentication",
        variant: "destructive",
      });
    }
  };

  const renderStepOne = () => (
    <div className="space-y-4 py-4">
      <p className="text-sm text-muted-foreground mb-4">
        Select the type of destination where you want to export your data.
      </p>
      <Tabs defaultValue="cloud" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="cloud">Cloud Storage</TabsTrigger>
          <TabsTrigger value="server">Servers & APIs</TabsTrigger>
        </TabsList>
        <TabsContent value="cloud" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DestinationTypeButton 
              type="Google Drive" 
              selected={destinationType === "Google Drive"}
              onClick={() => setDestinationType("Google Drive")}
            />
            <DestinationTypeButton 
              type="Microsoft OneDrive" 
              selected={destinationType === "Microsoft OneDrive"}
              onClick={() => setDestinationType("Microsoft OneDrive")}
            />
            <DestinationTypeButton 
              type="AWS S3" 
              selected={destinationType === "AWS S3"}
              onClick={() => setDestinationType("AWS S3")}
            />
          </div>
        </TabsContent>
        <TabsContent value="server" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DestinationTypeButton 
              type="FTP/SFTP" 
              selected={destinationType === "FTP/SFTP"}
              onClick={() => setDestinationType("FTP/SFTP")}
            />
            <DestinationTypeButton 
              type="Custom API" 
              selected={destinationType === "Custom API"}
              onClick={() => setDestinationType("Custom API")}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderStepTwo = () => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Destination Name</Label>
        <Input 
          id="name" 
          placeholder="e.g., Monthly Backup Drive" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      {oauthError && (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{oauthError.description}</AlertTitle>
          <AlertDescription>
            {oauthError.detailedMessage || "Please try again or contact support."}
            {oauthError.error === "access_denied" && (
              <div className="mt-2">
                <p className="text-sm mt-2">To fix this:</p>
                <ol className="list-decimal list-inside text-sm mt-1">
                  <li>Go to Google Cloud Console</li>
                  <li>Navigate to "APIs & Services" &gt; "OAuth consent screen"</li>
                  <li>Add your email as a test user</li>
                  <li>Try again</li>
                </ol>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {destinationType === "FTP/SFTP" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="host">Host</Label>
            <Input 
              id="host" 
              placeholder="ftp.example.com" 
              onChange={(e) => updateCredential("host", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                placeholder="username" 
                onChange={(e) => updateCredential("username", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                onChange={(e) => updateCredential("password", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input 
                id="port" 
                placeholder="21" 
                onChange={(e) => updateCredential("port", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="path">Directory Path</Label>
              <Input 
                id="path" 
                placeholder="/backups" 
                onChange={(e) => updateCredential("path", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
      
      {destinationType === "Google Drive" && (
        <div className="space-y-4 flex flex-col items-center justify-center py-8">
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Connect to Google Drive by authorizing FlowTechs to access your account.
          </p>
          <Button 
            className="w-full max-w-xs"
            onClick={() => handleOAuthLogin('google_drive')}
          >
            Sign in with Google
          </Button>
        </div>
      )}
      
      {destinationType === "Microsoft OneDrive" && (
        <div className="space-y-4 flex flex-col items-center justify-center py-8">
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Connect to Microsoft OneDrive by authorizing FlowTechs to access your account.
          </p>
          <Button 
            className="w-full max-w-xs"
            onClick={() => handleOAuthLogin('onedrive')}
          >
            Sign in with Microsoft
          </Button>
        </div>
      )}
      
      {destinationType === "AWS S3" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access_key">Access Key</Label>
            <Input 
              id="access_key" 
              placeholder="AKIAIOSFODNN7EXAMPLE" 
              onChange={(e) => updateCredential("accessKey", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secret_key">Secret Key</Label>
            <Input 
              id="secret_key" 
              type="password" 
              placeholder="••••••••" 
              onChange={(e) => updateCredential("secretKey", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bucket">Bucket Name</Label>
              <Input 
                id="bucket" 
                placeholder="my-bucket" 
                onChange={(e) => updateCredential("bucket", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select onValueChange={(value) => updateCredential("region", value)}>
                <SelectTrigger id="region">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                  <SelectItem value="us-west-1">US West (N. California)</SelectItem>
                  <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                  <SelectItem value="ap-northeast-1">Asia Pacific (Tokyo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
      
      {destinationType === "Custom API" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="base_url">Base URL</Label>
            <Input 
              id="base_url" 
              placeholder="https://api.example.com" 
              onChange={(e) => updateCredential("baseUrl", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth_type">Authentication Type</Label>
            <Select onValueChange={(value) => updateCredential("authType", value)}>
              <SelectTrigger id="auth_type">
                <SelectValue placeholder="Select auth type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
                <SelectItem value="api_key">API Key</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="token">Authentication Token/Key</Label>
            <Input 
              id="token" 
              type="password" 
              placeholder="••••••••" 
              onChange={(e) => updateCredential("token", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="headers">Additional Headers (JSON)</Label>
            <Input 
              id="headers" 
              placeholder='{"Content-Type": "application/json"}' 
              onChange={(e) => updateCredential("headers", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderStepThree = () => (
    <div className="space-y-4 py-4">
      <p className="text-sm text-muted-foreground mb-4">
        Configure how you want your data to be exported to this destination.
      </p>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="export_format">Export Format</Label>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger id="export_format">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CSV">CSV</SelectItem>
              <SelectItem value="JSON">JSON</SelectItem>
              <SelectItem value="Parquet">Parquet</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="schedule">Export Schedule</Label>
          <Select value={schedule} onValueChange={setSchedule}>
            <SelectTrigger id="schedule">
              <SelectValue placeholder="Select schedule" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Manual">Manual</SelectItem>
              <SelectItem value="Daily">Daily</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const canProceedFromStep2 = () => {
    if (name === "") return false;
    
    if (destinationType === "Google Drive" || destinationType === "Microsoft OneDrive") {
      return oauthComplete;
    }
    
    if (destinationType === "AWS S3") {
      return credentials.accessKey && credentials.secretKey && credentials.bucket && credentials.region;
    }
    
    if (destinationType === "FTP/SFTP") {
      return credentials.host && credentials.username && credentials.password;
    }
    
    if (destinationType === "Custom API") {
      return credentials.baseUrl;
    }
    
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 1 && "Select Destination Type"}
            {currentStep === 2 && `Configure ${destinationType}`}
            {currentStep === 3 && "Export Settings"}
          </DialogTitle>
        </DialogHeader>
        
        <div>
          <div className="flex items-center justify-between mb-8">
            <StepIndicator step={1} currentStep={currentStep} />
            <div className="flex-grow mx-2 h-1 bg-muted rounded-full">
              <div 
                className="h-full bg-primary rounded-full transition-all" 
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              ></div>
            </div>
            <StepIndicator step={2} currentStep={currentStep} />
            <div className="flex-grow mx-2 h-1 bg-muted rounded-full">
              <div 
                className="h-full bg-primary rounded-full transition-all" 
                style={{ width: `${(currentStep === 3 ? 1 : 0) * 100}%` }}
              ></div>
            </div>
            <StepIndicator step={3} currentStep={currentStep} />
          </div>
        
          {currentStep === 1 && renderStepOne()}
          {currentStep === 2 && renderStepTwo()}
          {currentStep === 3 && renderStepThree()}
        </div>
        
        <DialogFooter className="flex justify-between">
          {currentStep > 1 && (
            <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>
              Back
            </Button>
          )}
          <div>
            <Button variant="ghost" onClick={handleClose} className="mr-2">
              Cancel
            </Button>
            {currentStep < 3 ? (
              <Button 
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={currentStep === 1 && !destinationType || currentStep === 2 && !canProceedFromStep2()}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                Add Destination
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const StepIndicator: React.FC<{ step: number; currentStep: number }> = ({ step, currentStep }) => {
  const isCompleted = step < currentStep;
  const isActive = step === currentStep;
  
  return (
    <div 
      className={`
        flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium
        ${isCompleted ? 'bg-primary text-primary-foreground' : isActive ? 'border-2 border-primary text-primary' : 'bg-muted text-muted-foreground'}
      `}
    >
      {step}
    </div>
  );
};

const DestinationTypeButton: React.FC<{ 
  type: string; 
  selected: boolean;
  onClick: () => void;
}> = ({ type, selected, onClick }) => {
  return (
    <div 
      className={`
        p-4 border rounded-md text-center cursor-pointer transition-all
        ${selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
      `}
      onClick={onClick}
    >
      <p className="font-medium">{type}</p>
    </div>
  );
};

export default AddDestinationModal;
