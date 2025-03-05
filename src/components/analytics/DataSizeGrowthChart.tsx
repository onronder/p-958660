
import React from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ChartData } from "@/hooks/useAnalyticsData";

interface DataSizeGrowthChartProps {
  dataSizeData: ChartData[];
}

const DataSizeGrowthChart: React.FC<DataSizeGrowthChartProps> = ({ dataSizeData }) => {
  return (
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
  );
};

export default DataSizeGrowthChart;
