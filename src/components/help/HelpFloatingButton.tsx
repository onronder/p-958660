
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HelpFloatingButton = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 right-6">
      <Button 
        className="h-14 w-14 rounded-full shadow-lg" 
        onClick={() => navigate("/help")}
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default HelpFloatingButton;
