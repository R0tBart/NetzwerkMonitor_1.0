import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Server, 
  TrendingUp, 
  Bell, 
  Settings, 
  Network,
  User,
  Shield
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Sicherheit", href: "/security", icon: Shield },
  { name: "Geräte", href: "/devices", icon: Server },
  { name: "Analysen", href: "/analytics", icon: TrendingUp },
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Einstellungen", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white dark:bg-sidebar shadow-lg border-r border-slate-200 dark:border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200 dark:border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Network className="text-white h-4 w-4" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-sidebar-foreground">NetzMonitor</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href === "/" && location === "/");
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors",
                      isActive
                        ? "bg-primary text-white"
                        : "text-slate-600 dark:text-sidebar-foreground hover:bg-slate-100 dark:hover:bg-sidebar-accent"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200 dark:border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center">
            <User className="text-slate-600 dark:text-slate-300 h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-800 dark:text-sidebar-foreground">Admin User</p>
            <p className="text-xs text-slate-500 dark:text-muted-foreground">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
