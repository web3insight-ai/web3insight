import { Outlet } from "@remix-run/react";

function AdminLayout() {
  return (
    <div className="flex flex-col h-screen">
      <header className="flex-shrink-0 h-14 p-4 bg-slate-200">
        header
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
