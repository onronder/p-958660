
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

const Unauthorized = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="text-destructive mb-6">
        <ShieldAlert size={64} />
      </div>
      <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        You don't have permission to access this page. Please log in or contact your administrator for access.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link to="/">Return to Home</Link>
        </Button>
        <Button asChild>
          <Link to="/login">Log In</Link>
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
