import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { Chip } from "@nextui-org/react";

import { canManageEcosystems, canManageEvents } from "~/auth/helper";
import { getUser } from "~/auth/repository";
import Navbar from "../../src/components/navbar";
import { getRoleName, getRoleColor, getEffectiveRole } from "@/utils/role";
import AdminNavMenu from './AdminNavMenu';

interface AdminLayoutProps {
  children: React.ReactNode;
}

async function getAdminUser() {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const url = `${protocol}://${host}/admin`;

  const request = new Request(url, {
    headers: Object.fromEntries(headersList.entries()),
  });

  const user = await getUser(request);

  if (!canManageEcosystems(user) && !canManageEvents(user)) {
    notFound();
  }

  return user;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getAdminUser();

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
                Admin Panel
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
            <AdminNavMenu user={user} />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow flex flex-col min-h-0 overflow-auto bg-background dark:bg-background-dark">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
