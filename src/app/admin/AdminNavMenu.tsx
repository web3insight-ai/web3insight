"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { canManageEcosystems, canManageEvents } from "~/auth/helper";
import type { ApiUser } from "~/auth/typing";
import { SmallCapsLabel } from "$/primitives";

type MenuItem = {
  text: string;
  path: string;
  childrenPrefix?: string;
  code: string;
};

interface AdminNavMenuProps {
  user: ApiUser | null;
}

function buildMenu(user: ApiUser | null): MenuItem[] {
  const menuItems: MenuItem[] = [];

  if (canManageEcosystems(user)) {
    menuItems.push({
      text: "Ecosystems",
      path: "/admin/ecosystems",
      childrenPrefix: "/admin/ecosystems",
      code: "01",
    });
  }

  if (canManageEvents(user)) {
    menuItems.push({
      text: "Events",
      path: "/admin/events",
      childrenPrefix: "/admin/events",
      code: "02",
    });
  }

  return menuItems;
}

function isMenuItemActive(pathname: string, item: MenuItem): boolean {
  return (
    item.path === pathname ||
    (!!item.childrenPrefix && pathname.startsWith(item.childrenPrefix))
  );
}

function AdminNavMenu({ user }: AdminNavMenuProps) {
  const pathname = usePathname();
  const menuItems = buildMenu(user);

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="px-2">
        <SmallCapsLabel tone="subtle">administration</SmallCapsLabel>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = isMenuItemActive(pathname, item);

          return (
            <Link
              key={item.text}
              className={clsx(
                "group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-[2px] transition-colors",
                "border",
                {
                  "bg-bg-raised text-accent border-rule-strong": isActive,
                  "text-fg border-transparent hover:border-rule hover:bg-bg-raised":
                    !isActive,
                },
              )}
              href={item.path}
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={clsx(
                    "font-mono text-[10px] tracking-[0.12em]",
                    isActive ? "text-accent" : "text-fg-muted",
                  )}
                >
                  {item.code}
                </span>
                <span className="font-medium">{item.text}</span>
              </div>

              <ArrowRight
                size={14}
                className={clsx(
                  "transition-all duration-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-1",
                  {
                    "opacity-100 text-accent": isActive,
                    "text-fg-muted": !isActive,
                  },
                )}
              />
            </Link>
          );
        })}
      </nav>

      {/* Navigation Footer */}
      <div className="px-2 pt-4 border-t border-rule">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-fg-muted">
          admin panel
        </p>
        <p className="text-xs text-fg-subtle mt-1">Manage your Web3Insight</p>
      </div>
    </div>
  );
}

export default AdminNavMenu;
