
import React from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ChartData } from "@/hooks/useAnalyticsData";

interface FrequencySuccessChartsProps {
  pullFrequencyData: ChartData[];
  uploadSuccessData: ChartData[];
}

const FrequencySuccessCharts: React.FC<FrequencySuccessChartsProps> = ({ 
  pullFrequencyData, 
  uploadSuccessData 
}) => {
  return (
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
  );
};

export default FrequencySuccessCharts;
