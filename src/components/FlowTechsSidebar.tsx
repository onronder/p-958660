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
  WaveSine
} from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { SidebarNavItem } from "@/types/nav"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { usePathname } from "next/navigation"
import { NavLink } from "react-router-dom"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

interface SidebarProps {
  className?: string
  items?: SidebarNavItem[]
}

export function FlowTechsSidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<string[]>([])
  const { user } = useAuth();
  
  useEffect(() => {
    // Expand the accordion item that contains the current path
    const activeItem = sidebarItems.find((item) => pathname?.startsWith(item.href))
    if (activeItem) {
      setExpanded([activeItem.title])
    }
  }, [pathname])
  
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
      icon: <WaveSine />
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
                className={`flex items-center text-sm font-medium py-2 px-3 rounded-lg hover:bg-secondary ${
                  pathname === item.href ? "bg-secondary" : "text-foreground"
                }`}
              >
                {item.icon && (
                  <item.icon className="mr-2 h-4 w-4" />
                )}
                {item.title}
              </NavLink>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
