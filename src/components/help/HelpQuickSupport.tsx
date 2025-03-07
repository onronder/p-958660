
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Mail, Phone, Play } from "lucide-react";

interface HelpQuickSupportProps {
  onStartTour: () => void;
}

const HelpQuickSupport = ({ onStartTour }: HelpQuickSupportProps) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Quick Support</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={onStartTour}
          >
            <Play className="mr-2 h-4 w-4" />
            Start Tour
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => window.open('mailto:support@flowtechs.com', '_blank')}
          >
            <Mail className="mr-2 h-4 w-4" />
            Email Support
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => window.open('tel:+1234567890', '_blank')}
          >
            <Phone className="mr-2 h-4 w-4" />
            Call Support
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Live Chat
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HelpQuickSupport;
