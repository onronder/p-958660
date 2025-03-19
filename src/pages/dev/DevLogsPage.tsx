
import React, { useState, useEffect } from 'react';
import { DevLogsViewer } from '@/components/dev/DevLogsViewer';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MultiSelect } from '@/components/dev/MultiSelect';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, AlertTriangle, Beaker } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShopifyApiTester from '@/components/dev/ShopifyApiTester';

export default function DevLogsPage() {
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [logLevelFilters, setLogLevelFilters] = useState<string[]>(['debug', 'info', 'warn', 'error', 'critical']);
  const [activeTab, setActiveTab] = useState('logs');

  // Log page visit
  useEffect(() => {
    // Record page visit in dev logs
    const logPageVisit = async () => {
      await supabase.from('dev_logs').insert({
        log_level: 'info',
        source: 'DevLogsPage',
        message: 'Developer logs page viewed',
      });
    };
    
    logPageVisit();
  }, []);

  const handleTruncateLogs = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('dev_logs').delete().gt('id', '0');
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Success',
        description: 'Development logs have been truncated.',
      });
      
      // Refresh the logs by forcing a reload of the DevLogsViewer
      window.location.reload();
    } catch (error) {
      console.error('Error truncating logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to truncate development logs.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setConfirmDialog(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="mb-6 border-dashed border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-yellow-700 dark:text-yellow-400">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Development Only
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm text-yellow-700 dark:text-yellow-400">
            This page is for development and debugging purposes only. It should not be included in production deployments.
          </CardDescription>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Developer Tools</h1>
          <p className="text-muted-foreground">View logs and test application components</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="logs" className="flex items-center">
            Logs
          </TabsTrigger>
          <TabsTrigger value="api-tester" className="flex items-center">
            <Beaker className="mr-2 h-4 w-4" />
            API Tester
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs" className="space-y-4">
          <div className="flex justify-end space-x-4 items-center mb-4">
            <div className="w-[350px]">
              <MultiSelect
                placeholder="Filter by log level"
                options={[
                  { value: 'debug', label: 'Debug' },
                  { value: 'info', label: 'Info' },
                  { value: 'warn', label: 'Warning' },
                  { value: 'error', label: 'Error' },
                  { value: 'critical', label: 'Critical' }
                ]}
                selectedValues={logLevelFilters}
                onChange={setLogLevelFilters}
              />
            </div>
            
            <Button 
              variant="destructive" 
              onClick={() => setConfirmDialog(true)}
              className="flex items-center"
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Truncate Logs
            </Button>
          </div>
          
          <DevLogsViewer logLevelFilters={logLevelFilters} />
        </TabsContent>
        
        <TabsContent value="api-tester">
          <ShopifyApiTester />
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Truncate Development Logs</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all log entries from the development logs table.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                handleTruncateLogs();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
