import { Link, useLocation } from "@remix-run/react";
import { Calendar, Database, Warehouse, Users } from "lucide-react";
import clsx from "clsx";

const navigationItems = [
  {
    name: "Ecosystems",
    href: "/ecosystems",
    icon: Warehouse,
  },
  {
    name: "Repositories", 
    href: "/repositories",
    icon: Database,
  },
  {
    name: "Developers",
    href: "/developers", 
    icon: Users,
  },
  {
    name: "EventInsight",
    href: "/events",
    icon: Calendar,
  },
];

function NavigationMenu() {
  const location = useLocation();

  return (
    <nav className="flex items-center justify-center gap-0.5">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
        
        return (
          <Link
            key={item.name}
            to={item.href}
            className={clsx(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50",
            )}
          >
            <Icon size={14} />
            <span className="hidden lg:inline">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default NavigationMenu;
