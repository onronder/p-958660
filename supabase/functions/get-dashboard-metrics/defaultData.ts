
// Default data to return when not authenticated or when errors occur
export const defaultData = {
  metrics: {
    totalDataProcessed: 1258.45,
    totalApiCalls: 8764,
    activeConnections: 12,
    lastUpdated: new Date().toISOString()
  },
  jobSummary: {
    totalJobs: 156,
    successfulJobs: 142,
    failedJobs: 14,
    lastUpdated: new Date().toISOString()
  },
  recentJobs: [
    {
      source: "Source 1",
      startDate: new Date(Date.now() - 3600000).toISOString().split('T')[0],
      duration: "00:15:30",
      rowsProcessed: 5280,
      status: "Success"
    },
    {
      source: "Source 2",
      startDate: new Date(Date.now() - 7200000).toISOString().split('T')[0],
      duration: "00:08:45",
      rowsProcessed: 3150,
      status: "Success"
    },
    {
      source: "Source 3",
      startDate: new Date(Date.now() - 10800000).toISOString().split('T')[0],
      duration: "00:22:15",
      rowsProcessed: 7820,
      status: "Failed"
    }
  ]
};
