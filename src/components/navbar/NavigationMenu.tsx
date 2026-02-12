"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Database,
  Warehouse,
  Users,
  Brain,
  ChevronDown,
  Layers,
  Lightbulb,
  Compass,
  DollarSign,
  CreditCard,
  ExternalLink,
  FileBarChart,
} from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { useState } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  disabled?: boolean;
  external?: boolean;
}

interface NavGroup {
  name: string;
  icon: React.ComponentType<{ size?: number }>;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    name: "ECO",
    icon: Layers,
    items: [
      { name: "Ecosystems", href: "/ecosystems", icon: Warehouse },
      { name: "Repositories", href: "/repositories", icon: Database },
      { name: "Developers", href: "/developers", icon: Users },
    ],
  },
  {
    name: "Insight",
    icon: Lightbulb,
    items: [
      { name: "EventInsight", href: "/events", icon: Calendar },
      { name: "DevInsight", href: "/devinsight", icon: Brain },
      { name: "Report", href: "/report", icon: FileBarChart },
    ],
  },
  {
    name: "Plaza",
    icon: Compass,
    items: [
      {
        name: "DevCard",
        href: "https://card.web3insight.ai/",
        icon: CreditCard,
        external: true,
      },
      { name: "x402", href: "/plaza/x402", icon: DollarSign },
    ],
  },
];

function NavDropdown({ group, index }: { group: NavGroup; index: number }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const GroupIcon = group.icon;

  // Check if any item in the group is active
  const isGroupActive = group.items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Popover
        placement="bottom"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        offset={8}
      >
        <PopoverTrigger>
          <button
            className={clsx(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
              isGroupActive
                ? "bg-primary/10 text-primary"
                : "text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50",
            )}
          >
            <GroupIcon size={14} />
            <span className="hidden lg:inline">{group.name}</span>
            <ChevronDown
              size={12}
              className={clsx(
                "hidden lg:inline transition-transform duration-200",
                isOpen && "rotate-180",
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-1 min-w-[160px] bg-white dark:bg-surface-dark shadow-lg border border-border dark:border-border-dark rounded-lg">
          <AnimatePresence>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item, itemIndex) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                if (item.disabled) {
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: itemIndex * 0.03 }}
                      className={clsx(
                        "flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium",
                        "text-gray-400 dark:text-gray-600 cursor-not-allowed",
                      )}
                    >
                      <Icon size={14} />
                      <span>{item.name}</span>
                      <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-600">
                        Soon
                      </span>
                    </motion.div>
                  );
                }

                const linkClassName = clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50",
                );

                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: itemIndex * 0.03 }}
                  >
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsOpen(false)}
                        className={linkClassName}
                      >
                        <Icon size={14} />
                        <span>{item.name}</span>
                        <ExternalLink
                          size={10}
                          className="ml-auto opacity-50"
                        />
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={linkClassName}
                      >
                        <Icon size={14} />
                        <span>{item.name}</span>
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        </PopoverContent>
      </Popover>
    </motion.div>
  );
}

function NavigationMenu() {
  return (
    <nav className="flex items-center justify-center gap-0.5">
      {navigationGroups.map((group, index) => (
        <NavDropdown key={group.name} group={group} index={index} />
      ))}
    </nav>
  );
}

export default NavigationMenu;
