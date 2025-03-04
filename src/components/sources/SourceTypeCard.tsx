
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export type SourceType = "Shopify" | "WooCommerce" | "Custom API" | "Google Sheets";

export interface SourceTypeOption {
  id: SourceType;
  title: string;
  description: string;
  availableStatus: "available" | "coming-soon";
}

interface SourceTypeCardProps {
  source: SourceTypeOption;
  onSelect: (sourceType: SourceType) => void;
}

const SourceTypeCard: React.FC<SourceTypeCardProps> = ({ source, onSelect }) => {
  return (
    <Card 
      className={`cursor-pointer hover:border-primary transition-all ${
        source.availableStatus === "coming-soon" ? "opacity-60" : ""
      }`}
      onClick={() => source.availableStatus === "available" && onSelect(source.id)}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {source.title}
          {source.availableStatus === "coming-soon" && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              Coming Soon
            </span>
          )}
        </CardTitle>
        <CardDescription>{source.description}</CardDescription>
      </CardHeader>
    </Card>
  );
};

export default SourceTypeCard;
