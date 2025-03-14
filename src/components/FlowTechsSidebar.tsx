
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
    <div className="sidebar">
      <div className="flex flex-col h-full">
        <div className="flex items-center p-6">
          <h2 className="text-2xl font-bold text-indigo-500">FlowTechs</h2>
          <button className="ml-auto hover:bg-gray-100 rounded-full p-1 transition-all duration-200 dark:hover:bg-gray-800">
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
          <ul className="space-y-0.5">
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
              <Sparkles className="h-4 w-4 mr-2 text-indigo-400" />
              <span>Pro Features</span>
            </div>
            
            <div className="flowtech-pro-section">
              <ul>
                {proFeatures.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <li key={item.path} className="mb-1 last:mb-0">
                      <Link
                        to={item.path}
                        className={cn(
                          "flowtech-pro-item",
                          isActive ? "pro-feature-active" : ""
                        )}
                      >
                        <Icon className="flowtech-pro-icon" />
                        <div className="flowtech-pro-content">
                          <span className="flex-grow text-sm">{item.label}</span>
                          <span className="flowtech-pro-badge">PRO</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
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
