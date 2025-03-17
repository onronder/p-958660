
import {
  BarChartHorizontal,
  CalendarClock,
  Database,
  FileText,
  HardDrive,
  HelpCircle,
  LayoutDashboard,
  Settings,
  User,
  Users,
  Waves
} from "lucide-react"

import { NavLink } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

// Create a simple MainNav component
const MainNav = ({ className }: { className?: string }) => (
  <div className={className}>
    <h1 className="text-xl font-bold">FlowTechs</h1>
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
  
  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard />
    },
    {
      title: "My Sources",
      href: "/sources",
      icon: <Database />
    },
    {
      title: "My Datasets",
      href: "/my-datasets",
      icon: <FileText />
    },
    {
      title: "Transformations",
      href: "/transform",
      icon: <Waves />
    },
    {
      title: "Destinations",
      href: "/destinations",
      icon: <HardDrive />
    },
    {
      title: "Jobs",
      href: "/jobs",
      icon: <CalendarClock />
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChartHorizontal />
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings />
    },
    {
      title: "Help",
      href: "/help",
      icon: <HelpCircle />
    }
  ];

  return (
    <div className="fixed h-screen w-64 border-r bg-background px-4 py-6">
      <div className="flex flex-col space-y-4 py-4">
        <div className="px-3 py-2">
          <MainNav className="flex flex-col" />
        </div>
        <div className="flex-1 space-y-1">
          {sidebarItems?.length ? (
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.href}
                  className={({ isActive }) => `flex items-center text-sm font-medium py-2 px-3 rounded-lg hover:bg-secondary ${
                    isActive ? "bg-secondary" : "text-foreground"
                  }`}
                >
                  {item.icon && (
                    <span className="mr-2 h-4 w-4">{item.icon}</span>
                  )}
                  {item.title}
                </NavLink>
              ))}
            </div>
          ) : null}
        </div>
        {onLogout && (
          <div className="px-3 mt-6">
            <button 
              onClick={onLogout} 
              className="flex items-center text-sm font-medium py-2 px-3 rounded-lg hover:bg-secondary text-foreground w-full text-left"
            >
              <User className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
