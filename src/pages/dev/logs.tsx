
import React from 'react';
import { DevLogsViewer } from '@/components/dev/DevLogsViewer';
import { devLogger } from '@/utils/DevLogger';

export default function DevLogsPage() {
  // Log page visit
  React.useEffect(() => {
    devLogger.info('DevLogsPage', 'Development logs page viewed');
    
    // Example of generating different log levels for testing
    devLogger.debug('DevLogsPage', 'This is a debug message', { testValue: 42 });
    devLogger.info('DevLogsPage', 'This is an info message', { status: 'active' });
    devLogger.warn('DevLogsPage', 'This is a warning message', { alert: true });
    devLogger.error('DevLogsPage', 'This is an error message', new Error('Test error'), { critical: false });
  }, []);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Developer Logs</h1>
      <DevLogsViewer />
    </div>
  );
}
