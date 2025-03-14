
import React from "react";
import { Card } from "@/components/ui/card";
import { PieChart as RechartssPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ETLData } from "@/hooks/useAnalyticsData";

interface EtlAnalysisChartProps {
  etlData: ETLData[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const EtlAnalysisChart: React.FC<EtlAnalysisChartProps> = ({ etlData }) => {
  return (
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
  );
};

export default EtlAnalysisChart;
