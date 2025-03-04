
import { Card } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart as RechartssPieChart, Pie, Cell } from "recharts";

const pullFrequencyData = [
  { time: "10:00", value: 5000 },
  { time: "11:00", value: 6500 },
  { time: "12:00", value: 9800 },
  { time: "13:00", value: 10200 },
  { time: "14:00", value: 9500 },
];

const uploadSuccessData = [
  { time: "10:00", value: 100 },
  { time: "11:00", value: 98 },
  { time: "12:00", value: 85 },
  { time: "13:00", value: 90 },
  { time: "14:00", value: 98 },
];

const dataSizeData = [
  { month: "Jan", value: 2000 },
  { month: "Feb", value: 1800 },
  { month: "Mar", value: 8000 },
  { month: "Apr", value: 3900 },
  { month: "May", value: 4000 },
  { month: "Jun", value: 3800 },
];

const etlData = [
  { name: "Extract", value: 40 },
  { name: "Transform", value: 30 },
  { name: "Load", value: 30 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const Analytics = () => {
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

      <h1 className="text-3xl font-bold text-primary">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4">Recent ETL Analysis</h3>
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
          <h3 className="text-lg font-semibold mb-4">Data Size</h3>
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
