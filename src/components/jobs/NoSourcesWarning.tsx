
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NoSourcesWarning = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-6 text-center">
      <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No Data Sources Available</h3>
      <p className="text-muted-foreground mb-6">
        You need to connect a data source before you can create automated jobs.
      </p>
      <Button onClick={() => navigate("/sources")}>
        Go to My Sources
      </Button>
    </div>
  );
};

export default NoSourcesWarning;
