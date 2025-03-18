
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
  Waves,
  LogOut,
  Bug
} from "lucide-react"

import { NavLink } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/components/theme/ThemeProvider"
import { Badge } from "@/components/ui/badge"

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
  isPro?: boolean;
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
      href: "/datasets",
      icon: <FileText className="h-5 w-5" />
    },
    {
      title: "Transformations",
      href: "/transformations",
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
      icon: <Lightbulb className="h-5 w-5" />,
      isPro: true
    },
    {
      title: "Storage",
      href: "/storage",
      icon: <Box className="h-5 w-5" />,
      isPro: true
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />
    },
    {
      title: "Dev Logs",
      href: "/dev/logs",
      icon: <Bug className="h-5 w-5" />
    }
  ];

  return (
    <div className="fixed h-screen w-64 border-r bg-card shadow-sm z-10">
      <div className="flex flex-col h-full">
        <div className="p-4">
          <MainNav className="flex items-center mb-6" />
        </div>
        <div className="flex-1 overflow-y-auto px-3">
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.href}
                className={({ isActive }) => `flex items-center justify-between text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "bg-primary/10 text-primary font-semibold" 
                    : "text-foreground hover:bg-secondary/80"
                }`}
              >
                <div className="flex items-center">
                  {item.icon && (
                    <span className="mr-3 h-5 w-5">{item.icon}</span>
                  )}
                  {item.title}
                </div>
                {item.isPro && (
                  <Badge variant="secondary" className="bg-violet-600 text-white text-[10px] ml-2 h-5">
                    PRO
                  </Badge>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="mt-auto border-t p-4">
          <NavLink
            to="/help"
            className={({ isActive }) => `flex items-center text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 ${
              isActive 
                ? "bg-primary/10 text-primary font-semibold" 
                : "text-foreground hover:bg-secondary/80"
            }`}
          >
            <HelpCircle className="mr-3 h-5 w-5" />
            Help
          </NavLink>
          
          {onLogout && (
            <button 
              onClick={onLogout} 
              className="flex items-center text-sm font-medium w-full py-2 px-3 rounded-lg hover:bg-secondary/80 text-foreground mt-2 text-left"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
