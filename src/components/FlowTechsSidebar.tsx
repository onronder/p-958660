
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: FileText, label: "My Sources", path: "/sources" },
  { icon: ExternalLink, label: "Load & Transform", path: "/transform" },
  { icon: Database, label: "My Destinations", path: "/destinations" },
  { icon: Briefcase, label: "Jobs", path: "/jobs" },
  { icon: PieChart, label: "Analytics", path: "/analytics" },
  { icon: HardDrive, label: "Data Storage", path: "/storage" },
  { icon: Zap, label: "AI Insights", path: "/insights" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const FlowTechsSidebar = () => {
  const location = useLocation();

  return (
    <div className="fixed left-0 top-0 h-full w-64 border-r border-border bg-background">
      <div className="flex flex-col h-full">
        <div className="flex items-center p-6">
          <h2 className="text-2xl font-bold text-primary">FlowTechs</h2>
          <button className="ml-auto">
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
        
        <nav className="flex-1 px-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      isActive 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-secondary hover:bg-primary/5"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 mt-auto border-t border-border">
          <Link
            to="/logout"
            className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-primary/5 rounded-lg transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FlowTechsSidebar;
