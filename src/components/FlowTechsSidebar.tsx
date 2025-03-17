
import {
  BarChartHorizontal,
  CalendarClock,
  Database,
  FileText,
  HardDrive,
  HelpCircle,
  LayoutDashboard,
  Lightbulb,
  Settings,
  User,
  Box,
  Waves
} from "lucide-react"

import { NavLink } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/components/theme/ThemeProvider"

// Create a simple MainNav component
const MainNav = ({ className }: { className?: string }) => (
  <div className={className}>
    <h1 className="text-xl font-bold text-primary">FlowTechs</h1>
  </div>
);

// Define the SidebarNavItem type
interface SidebarNavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

interface FlowTechsSidebarProps {
  onLogout?: () => void;
  className?: string;
}

export function FlowTechsSidebar({ onLogout, className }: FlowTechsSidebarProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      title: "My Sources",
      href: "/sources",
      icon: <Database className="h-5 w-5" />
    },
    {
      title: "My Datasets",
      href: "/my-datasets",
      icon: <FileText className="h-5 w-5" />
    },
    {
      title: "Transformations",
      href: "/transform",
      icon: <Waves className="h-5 w-5" />
    },
    {
      title: "Destinations",
      href: "/destinations",
      icon: <HardDrive className="h-5 w-5" />
    },
    {
      title: "Jobs",
      href: "/jobs",
      icon: <CalendarClock className="h-5 w-5" />
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChartHorizontal className="h-5 w-5" />
    },
    {
      title: "AI Insights",
      href: "/insights",
      icon: <Lightbulb className="h-5 w-5" />
    },
    {
      title: "Storage",
      href: "/storage",
      icon: <Box className="h-5 w-5" />
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />
    },
    {
      title: "Help",
      href: "/help",
      icon: <HelpCircle className="h-5 w-5" />
    }
  ];

  return (
    <div className="fixed h-screen w-64 border-r bg-card shadow-sm z-10">
      <div className="flex flex-col space-y-4 p-4">
        <div className="px-3 py-2">
          <MainNav className="flex flex-col" />
        </div>
        <div className="flex-1 space-y-1">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.href}
              className={({ isActive }) => `flex items-center text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? "bg-primary/10 text-primary font-semibold" 
                  : "text-foreground hover:bg-secondary/80"
              }`}
            >
              {item.icon && (
                <span className="mr-3 h-5 w-5">{item.icon}</span>
              )}
              {item.title}
            </NavLink>
          ))}
        </div>
        {onLogout && (
          <div className="px-3 mt-6 border-t pt-4">
            <button 
              onClick={onLogout} 
              className="flex items-center text-sm font-medium py-2 px-3 rounded-lg hover:bg-secondary/80 text-foreground w-full text-left"
            >
              <User className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
