import AuthFormDialogViewWidget from "~/auth/views/auth-form-dialog";

import Navbar from "../../components/navbar";

import type { DefaultLayoutProps } from "./typing";

function DefaultLayout({ children, user }: DefaultLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50  dark:bg-gray-900">
      <header className="sticky top-0 z-20 border-b bg-white dark:bg-gray-900 dark:border-gray-800">
        <Navbar className="max-w-[1200px] mx-auto" user={user} />
      </header>

      <main className="pb-20">
        {children}
      </main>

      {/* Auth Modal for login/register/password reset */}
      <AuthFormDialogViewWidget />
    </div>
  );
}

export default DefaultLayout;
