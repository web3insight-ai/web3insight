import AuthFormDialogViewWidget from "~/auth/views/auth-form-dialog";

import Navbar from "../../components/navbar";

import type { DefaultLayoutProps } from "./typing";

function DefaultLayout({ children, user }: DefaultLayoutProps) {
  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-border dark:border-border-dark">
        <Navbar className="max-w-content mx-auto" user={user} />
      </header>

      <main className="pb-24">
        {children}
      </main>

      {/* Auth Modal for login/register/password reset */}
      <AuthFormDialogViewWidget />
    </div>
  );
}

export default DefaultLayout;
