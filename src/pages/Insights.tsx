
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, ChevronRight, Star, Brain, Zap } from "lucide-react";

const insights = [
  {
    title: "Optimize Order Processing Pipeline",
    description: "Based on your recent data flow patterns, AI suggests optimizing your order processing pipeline by adding a filter for cancelled orders before transformation.",
    type: "Performance Suggestion",
    impact: "High",
  },
  {
    title: "Potential Duplicate Products",
    description: "AI has detected 24 potential duplicate products in your catalog. Consider running the de-duplication transformation.",
    type: "Data Quality",
    impact: "Medium",
  },
  {
    title: "Scheduled Job Timing Improvement",
    description: "Your daily sync job is running at peak API usage time (6:00 AM). Consider shifting to 4:30 AM for better performance.",
    type: "Optimization",
    impact: "Medium",
  },
];

const premiumInsights = [
  {
    title: "Revenue Trend Analysis",
    description: "Unlock advanced revenue forecasting and trend analysis based on your historical order data.",
    icon: Brain,
  },
  {
    title: "Customer Segmentation",
    description: "Automatically segment your customers based on purchase behavior and demographics.",
    icon: Zap,
  },
  {
    title: "Inventory Optimization",
    description: "Get AI-powered recommendations for inventory levels based on sales velocity and seasonality.",
    icon: Star,
  },
];

const Insights = () => {
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
            <span className="font-bold">⚡ The AI Insights</span> page provides intelligent recommendations and analysis of your data flows and transformations, helping you optimize your data integration processes.
          </p>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-primary">AI Insights</h1>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Recommended Actions</h2>
        
        {insights.map((insight, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{insight.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{insight.type}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      insight.impact === "High" 
                        ? "bg-red-100 text-red-800" 
                        : insight.impact === "Medium" 
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      {insight.impact} Impact
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground mt-2">{insight.description}</p>
                <div className="mt-4">
                  <Button variant="outline" className="text-sm">Apply Suggestion</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Premium AI Insights</h2>
          <Button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600">
            Upgrade to Pro
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {premiumInsights.map((feature, index) => (
            <Card key={index} className="p-4 bg-white border-2 border-blue-100">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-1">
                  <feature.icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                  <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-blue-600">
                    <span className="text-xs">Learn more</span>
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Insights;
