
import React from "react";
import ShopifySchemaCacheStatus from "../ShopifySchemaCacheStatus";
import { Separator } from "@/components/ui/separator";

interface SchemaCacheSectionProps {
  sourceId: string;
}

const SchemaCacheSection: React.FC<SchemaCacheSectionProps> = ({ sourceId }) => {
  return (
    <div className="pt-4">
      <Separator className="mb-4" />
      <ShopifySchemaCacheStatus sourceId={sourceId} />
    </div>
  );
};

export default SchemaCacheSection;
