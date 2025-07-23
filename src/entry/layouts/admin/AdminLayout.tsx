import { Outlet } from "@remix-run/react";
import { Chip } from "@nextui-org/react";

import Navbar from "../../components/navbar";
import { getRoleName, getRoleColor, getEffectiveRole } from "@/utils/role";

import type { AdminLayoutProps } from "./typing";
import NavMenu from "./NavMenu";

function AdminLayout({ user, settings = false }: AdminLayoutProps) {
  // Get effective role (highest priority role from allowed roles)
  const effectiveRole = user?.role ? getEffectiveRole(user.role.default_role, user.role.allowed_roles) : null;
  
  return (
    <div className="flex flex-col h-screen bg-background dark:bg-background-dark">
      <header className="flex-shrink-0 glass-morphism border-b border-border dark:border-border-dark">
        <Navbar
          user={user}
          extra={
            <div className="flex items-center gap-3 border-l border-border dark:border-border-dark pl-4">
              <span className="text-sm font-medium text-foreground dark:text-foreground-dark">
                {settings ? "Settings" : "Admin Panel"}
              </span>
              {effectiveRole && (
                <Chip 
                  size="sm"
                  color={getRoleColor(effectiveRole)}
                  variant="flat"
                  className="text-xs font-medium"
                >
                  {getRoleName(effectiveRole)}
                </Chip>
              )}
            </div>
          }
        />
      </header>
      <main className="flex-grow flex min-h-0">
        {/* Sidebar */}
        <aside className="flex-shrink-0 w-64 bg-white dark:bg-surface-dark border-r border-border dark:border-border-dark hidden md:block">
          <div className="h-full p-4 overflow-y-auto">
            <NavMenu settings={settings} />
          </div>
        </aside>
        
        {/* Main Content */}
        <div className="flex-grow flex flex-col min-h-0 overflow-auto bg-background dark:bg-background-dark">
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
