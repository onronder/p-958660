
import React from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header would go here */}
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Footer would go here */}
      <Toaster />
    </div>
  );
};

export default Layout;
