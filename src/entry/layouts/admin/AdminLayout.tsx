import { Outlet } from "@remix-run/react";

import Navbar from "../../components/navbar";

import type { AdminLayoutProps } from "./typing";
import NavMenu from "./NavMenu";

function AdminLayout({ user, settings = false }: AdminLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="flex-shrink-0 border-b bg-white">
        <Navbar
          user={user}
          extra={
            <div className="flex items-center border-l pl-4">
              <span>{settings ? "Settings" : "Admin"}</span>
            </div>
          }
        />
      </header>
      <main className="flex-grow flex min-h-0">
        <div className="flex-shrink-0 w-60 p-4 bg-slate-300">
          <NavMenu settings={settings} />
        </div>
        <div className="flex-grow flex flex-col min-h-0 p-10 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
