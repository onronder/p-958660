
import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const AnalyticsLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-9 w-24" />
      </div>
      
      {/* Charts skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="relative">
            <Skeleton className="h-[300px] w-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground text-center px-4">
                As soon as you have data flow, you will see reports about your system data where you now see a blank graph.
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="relative">
            <Skeleton className="h-[300px] w-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground text-center px-4">
                As soon as you have data flow, you will see reports about your system data where you now see a blank graph.
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 lg:col-span-2">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="relative">
            <Skeleton className="h-[200px] w-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground text-center px-4">
                As soon as you have data flow, you will see reports about your system data where you now see a blank graph.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsLoadingSkeleton;
