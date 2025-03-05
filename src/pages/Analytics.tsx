
import { Card } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart as RechartssPieChart, Pie, Cell } from "recharts";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const Analytics = () => {
  const { 
    etlData, 
    pullFrequencyData, 
    uploadSuccessData, 
    dataSizeData, 
    isLoading, 
    isError,
    refetch 
  } = useAnalyticsData();

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 rounded-lg p-4 flex items-start space-x-4 mb-4">
          <div className="text-red-500 mt-1">
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
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-red-800">
              There was an error loading the analytics data. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-4 mb-4">
        <div className="text-blue-500 mt-1">
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
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-blue-800">
            <span className="font-bold">⚡ The Analytics</span> page provides insights and visualizations on your data flow, transformation performance, and integration efficiency, helping you make data-driven decisions.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Analytics</h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4">ETL Process Analysis</h3>
          <div className="h-[300px] w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartssPieChart>
                <Pie
                  data={etlData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {etlData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartssPieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center items-center space-x-4 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#0088FE] mr-1"></div>
              <span className="text-sm">Extract</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#00C49F] mr-1"></div>
              <span className="text-sm">Transform</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#FFBB28] mr-1"></div>
              <span className="text-sm">Load</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4">Data Pull Frequency</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pullFrequencyData}>
                <XAxis dataKey="time" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0066FF"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <h3 className="text-lg font-semibold mt-8 mb-4">Upload Success Rates</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={uploadSuccessData}>
                <XAxis dataKey="time" stroke="#888888" />
                <YAxis domain={[0, 100]} stroke="#888888" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#00C49F"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4">Data Size Growth</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataSizeData} barSize={20}>
                <XAxis dataKey="month" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
