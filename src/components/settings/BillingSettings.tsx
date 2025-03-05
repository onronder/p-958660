
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, CheckCircle, Sparkles, Database, ArrowRight, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

// Type definitions
interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: PlanFeature[];
  isPopular?: boolean;
  isCurrent?: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Failed";
  downloadUrl: string;
}

const BillingSettings = () => {
  const { toast } = useToast();
  
  // Subscription state
  const [subscription, setSubscription] = useState({
    plan: "Pro Plan",
    status: "Active",
    nextBillingDate: "November 15, 2023",
    amount: 49.99,
  });
  
  // Plans data
  const [plans] = useState<Plan[]>([
    {
      id: "free",
      name: "Free",
      price: 0,
      description: "For individuals and small projects",
      features: [
        { name: "1 Data Source", included: true },
        { name: "2 Transformations", included: true },
        { name: "1 Destination", included: true },
        { name: "Weekly Scheduling", included: true },
        { name: "Community Support", included: true },
        { name: "Advanced Analytics", included: false },
        { name: "API Access", included: false },
        { name: "Webhook Integrations", included: false },
      ],
    },
    {
      id: "pro",
      name: "Pro Plan",
      price: 49.99,
      description: "For growing businesses and teams",
      features: [
        { name: "10 Data Sources", included: true },
        { name: "Unlimited Transformations", included: true },
        { name: "5 Destinations", included: true },
        { name: "Daily Scheduling", included: true },
        { name: "Priority Support", included: true },
        { name: "Advanced Analytics", included: true },
        { name: "API Access", included: true },
        { name: "Webhook Integrations", included: true },
      ],
      isPopular: true,
      isCurrent: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 199.99,
      description: "For large organizations with complex needs",
      features: [
        { name: "Unlimited Data Sources", included: true },
        { name: "Unlimited Transformations", included: true },
        { name: "Unlimited Destinations", included: true },
        { name: "Custom Scheduling", included: true },
        { name: "Dedicated Support", included: true },
        { name: "Advanced Analytics", included: true },
        { name: "API Access", included: true },
        { name: "Custom Integrations", included: true },
      ],
    },
  ]);
  
  // Invoices data
  const [invoices] = useState<Invoice[]>([
    {
      id: "INV-2023-001",
      date: "October 15, 2023",
      amount: 49.99,
      status: "Paid",
      downloadUrl: "#",
    },
    {
      id: "INV-2023-002",
      date: "September 15, 2023",
      amount: 49.99,
      status: "Paid",
      downloadUrl: "#",
    },
  ]);
  
  // Payment method state
  const [paymentMethod] = useState({
    cardType: "Visa",
    last4: "4242",
    expiry: "12/24",
  });
  
  // Handle plan upgrade
  const handleUpgrade = (planId: string) => {
    // This would typically redirect to LemonSqueezy checkout
    window.open(
      `https://checkout.lemonsqueezy.com/checkout?cart=bc106350-371e-49e0-bad3-9c8246ee35d1:1&checkout[email]=test@example.com&checkout[name]=John%20Doe`,
      "_blank"
    );
    
    toast({
      title: "Redirecting to checkout",
      description: "You are being redirected to the secure payment page.",
    });
  };
  
  // Handle cancel subscription
  const [isCancelling, setIsCancelling] = useState(false);
  
  const handleCancelSubscription = () => {
    setIsCancelling(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubscription({
        ...subscription,
        status: "Cancelled",
      });
      
      setIsCancelling(false);
      
      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been cancelled. You will still have access until the end of your billing period.",
      });
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>
                Manage your subscription plan and billing details
              </CardDescription>
            </div>
            <Badge variant={subscription.status === "Active" ? "default" : "secondary"}>
              {subscription.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-4 border border-border rounded-md">
              <div>
                <h3 className="font-semibold text-lg">{subscription.plan}</h3>
                <p className="text-muted-foreground">
                  {subscription.status === "Active" 
                    ? `Next billing date: ${subscription.nextBillingDate}`
                    : "Your subscription will end at the end of the billing period"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold">${subscription.amount}</p>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>
            
            {subscription.status === "Active" && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-destructive border-destructive">
                    Cancel Subscription
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Subscription</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Keep Subscription</Button>
                    <Button 
                      variant="destructive"
                      onClick={handleCancelSubscription}
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        "Confirm Cancellation"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Manage your payment details and billing address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-border rounded-md">
            <div className="flex items-center gap-3">
              <div className="bg-muted p-2 rounded">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{paymentMethod.cardType} ending in {paymentMethod.last4}</p>
                <p className="text-sm text-muted-foreground">Expires {paymentMethod.expiry}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center p-6 border border-dashed rounded-md">
              <p className="text-muted-foreground">No invoices found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map(invoice => (
                <div 
                  key={invoice.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 border border-border rounded-md"
                >
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{invoice.date}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      invoice.status === "Paid" ? "default" :
                      invoice.status === "Pending" ? "secondary" : "destructive"
                    }>
                      {invoice.status}
                    </Badge>
                    <p className="font-bold">${invoice.amount.toFixed(2)}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(invoice.downloadUrl, "_blank")}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <Card 
              key={plan.id} 
              className={`flex flex-col h-full relative ${
                plan.isPopular ? "border-primary shadow-md" : ""
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2">
                  <Badge className="bg-primary">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{plan.name}</span>
                  {plan.isCurrent && (
                    <Badge variant="outline" className="ml-2">
                      Current
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-grow">
                <div className="mb-4">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                
                <ul className="space-y-2 mt-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      {feature.included ? (
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                          <span className="h-0.5 w-2 bg-muted-foreground"></span>
                        </div>
                      )}
                      <span className={feature.included ? "" : "text-muted-foreground"}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                {plan.isCurrent ? (
                  <Button disabled className="w-full">Current Plan</Button>
                ) : (
                  <Button 
                    variant={plan.isPopular ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    Upgrade
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingSettings;
