
import React from "react";
import { Card } from "@/components/ui/card";

const SourcesLoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6">
          <div className="h-24 animate-pulse bg-gray-200 rounded"></div>
        </Card>
      ))}
    </div>
  );
};

export default SourcesLoadingSkeleton;
