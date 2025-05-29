import { Outlet } from "@remix-run/react";

import Navbar from "../../components/navbar";

import type { AdminLayoutProps } from "./typing";

function AdminLayout({ user }: AdminLayoutProps) {
  return (
    <div className="flex flex-col h-screen">
      <header className="flex-shrink-0 border-b bg-white">
        <Navbar
          user={user}
          extra={
            <div className="flex items-center border-l pl-4">
              <span>Admin</span>
            </div>
          }
        />
      </header>
      <main className="flex-grow flex">
        <div className="flex-shrink-0 w-60 p-4 bg-slate-300">
          sidebar
        </div>
        <div className="flex-grow flex flex-col p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
