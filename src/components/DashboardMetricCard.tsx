
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  iconColor: string;
}

const DashboardMetricCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
}: DashboardMetricCardProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h2 className="text-3xl font-bold mt-1">{value}</h2>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div className={`p-2 rounded-full ${iconColor} bg-opacity-10`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </Card>
  );
};

export default DashboardMetricCard;
