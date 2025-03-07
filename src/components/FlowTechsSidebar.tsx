
import {
  Home,
  FileText,
  ExternalLink,
  Database,
  Briefcase,
  PieChart,
  HardDrive,
  Zap,
  LogOut,
  Settings,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

interface FlowTechsSidebarProps {
  onLogout?: () => void;
}

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: FileText, label: "My Sources", path: "/sources" },
  { icon: ExternalLink, label: "Load & Transform", path: "/transform" },
  { icon: Database, label: "My Destinations", path: "/destinations" },
  { icon: Briefcase, label: "Jobs", path: "/jobs" },
  { icon: PieChart, label: "Analytics", path: "/analytics" },
];

const proFeatures = [
  { icon: HardDrive, label: "Data Storage", path: "/storage" },
  { icon: Zap, label: "AI Insights", path: "/insights" },
];

const FlowTechsSidebar = ({ onLogout }: FlowTechsSidebarProps) => {
  const location = useLocation();

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 border-r border-border bg-background shadow-sm z-10">
      <div className="flex flex-col h-full">
        <div className="flex items-center p-6">
          <h2 className="text-2xl font-bold text-primary">FlowTechs</h2>
          <button className="ml-auto hover:bg-gray-100 rounded-full p-1 transition-all duration-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>
        </div>
        
        <nav className="flex-1 px-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flowtech-sidebar-link",
                      isActive 
                        ? "flowtech-sidebar-link-active" 
                        : "flowtech-sidebar-link-inactive"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Pro Features Section with divider and label */}
          <div className="mt-6">
            <div className="sidebar-section-divider" />
            <div className="flex items-center px-4 py-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4 mr-2 text-accent" />
              <span>Pro Features</span>
            </div>
            
            <ul className="space-y-1 mt-1 pro-section">
              {proFeatures.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flowtech-sidebar-link",
                        isActive 
                          ? "pro-feature-active" 
                          : "pro-feature"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                      <span className="pro-label ml-auto">PRO</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <div className="p-4 mt-auto border-t border-border">
          <Link
            to="/settings"
            className={cn(
              "flowtech-sidebar-link",
              location.pathname === "/settings" 
                ? "flowtech-sidebar-link-active" 
                : "flowtech-sidebar-link-inactive"
            )}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
          
          <Link
            to="/help"
            className={cn(
              "flowtech-sidebar-link",
              location.pathname === "/help" 
                ? "flowtech-sidebar-link-active" 
                : "flowtech-sidebar-link-inactive"
            )}
          >
            <HelpCircle className="h-5 w-5" />
            <span>Help & Documentation</span>
          </Link>
          
          <button
            onClick={handleLogoutClick}
            className="flowtech-sidebar-link flowtech-sidebar-link-inactive w-full"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlowTechsSidebar;
